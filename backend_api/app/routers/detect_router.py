from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.detect_service import predict_from_upload

router = APIRouter(tags=["Detection"])

@router.post("/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Upload an image; returns list of detections:
    [{label, confidence, box: [x1,y1,x2,y2]}]
    """
    try:
        result = await predict_from_upload(file)
        return {"status": "success", "predictions": result}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
