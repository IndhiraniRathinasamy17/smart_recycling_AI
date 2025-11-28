import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from typing import List, Dict

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = Path(__file__).resolve().parents[2] / "ml_model" / "models" / "best.pt"

# Lazy model loader
_model = None
_model_loaded = False

def _load_yolo_model():
    global _model, _model_loaded
    if _model_loaded:
        return _model
    try:
        from ultralytics import YOLO
    except Exception as e:
        raise RuntimeError("Ultralytics (YOLO) is not installed. Install ultralytics and torch to enable detection.") from e

    if not MODEL_PATH.exists():
        raise RuntimeError(f"YOLO model not found at {MODEL_PATH}. Place your best.pt there.")
    _model = YOLO(str(MODEL_PATH))
    _model_loaded = True
    return _model

async def predict_from_upload(file: UploadFile) -> List[Dict]:
    # save file to uploads
    dest = UPLOAD_DIR / file.filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # call detection
    try:
        model = _load_yolo_model()
    except RuntimeError as e:
        # fallback basic response if model missing
        raise

    # Run detection (inference)
    results = model(str(dest))
    # results may be a list-like; take first
    out = []
    for r in results:
        # ultralytics result -> r.boxes if present
        boxes = getattr(r, "boxes", None)
        names = getattr(results[0], "names", None) or getattr(model, "model", None)
        # adapt for variations
        if boxes is None:
            # fallback: return stringified prediction
            out.append({"raw": str(r)})
            continue

        # boxes.xyxy, boxes.conf, boxes.cls
        xyxy = getattr(boxes, "xyxy", None)
        confs = getattr(boxes, "conf", None)
        cls = getattr(boxes, "cls", None)
        # convert tensors/numpy to lists
        try:
            for i in range(len(xyxy)):
                box = xyxy[i].tolist() if hasattr(xyxy[i], "tolist") else list(map(float, xyxy[i]))
                conf = float(confs[i]) if confs is not None else None
                cls_i = int(cls[i]) if cls is not None else None
                label = None
                if names and cls_i is not None:
                    # names may be dict or list-like
                    try:
                        label = names[cls_i]
                    except Exception:
                        label = str(cls_i)
                out.append({
                    "label": label,
                    "confidence": round(conf, 4) if conf is not None else None,
                    "box": [round(b, 2) for b in box]
                })
        except Exception:
            # if structure differs, return raw
            out.append({"raw": str(r)})
    return out
