from fastapi import APIRouter, UploadFile, File
import uuid, os
from app.services.audio_service import convert_to_wav, transcribe_audio

router = APIRouter()

AUDIO_DIR = "audio_uploads"
os.makedirs(AUDIO_DIR, exist_ok=True)

@router.post("/audio/transcribe")
async def transcribe_audio_api(file: UploadFile = File(...)):
    raw_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.webm")
    wav_path = raw_path.replace(".webm", ".wav")

    with open(raw_path, "wb") as f:
        f.write(file.file.read())

    convert_to_wav(raw_path, wav_path)
    text = transcribe_audio()

    return {"text": text}
