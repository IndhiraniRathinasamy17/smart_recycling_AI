# ml_model/predict.py
from ultralytics import YOLO
from pathlib import Path
import os

MODEL_PATH = Path(__file__).resolve().parents[1] / "ml_model" / "models" / "best.pt"

_model = None

def load_model(model_path: str = None):
    global _model
    if _model is not None:
        return _model
    path = model_path or MODEL_PATH
    if not Path(path).exists():
        raise RuntimeError(f"Model not found at {path}")
    _model = YOLO(str(path))
    return _model

def predict_image_file(image_path: str):
    m = load_model()
    results = m(image_path)
    detections = []
    for r in results:
        boxes = getattr(r, "boxes", None)
        names = getattr(m, "names", None) or getattr(results[0], "names", None)
        if boxes is None:
            continue
        xyxy = getattr(boxes, "xyxy", [])
        confs = getattr(boxes, "conf", [])
        cls = getattr(boxes, "cls", [])
        for i in range(len(xyxy)):
            box = xyxy[i].tolist() if hasattr(xyxy[i], "tolist") else list(map(float, xyxy[i]))
            conf = float(confs[i]) if confs is not None else None
            cls_i = int(cls[i]) if cls is not None else None
            label = names[cls_i] if names and cls_i is not None else str(cls_i)
            detections.append({
                "label": label,
                "confidence": round(conf, 4),
                "box": [round(b, 2) for b in box]
            })
    return detections
