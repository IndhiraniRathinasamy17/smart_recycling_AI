# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.routers.chat_router import router as chat_router
# from app.routers.file_router import router as file_router
# from app.routers.audio_router import router as audio_router

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(chat_router)
# app.include_router(file_router)
# app.include_router(audio_router)

# @app.get("/")
# def home():
#     return {"message": "Smart Recycling AI Backend Running"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# load .env
load_dotenv()

from app.routers import detect_router, nlp_router, file_router, audio_router, chat_router

app = FastAPI(title="Smart Recycling AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(detect_router.router, prefix="/detect")
app.include_router(nlp_router.router, prefix="/nlp")
app.include_router(file_router.router)
app.include_router(audio_router.router)
app.include_router(chat_router.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-recycling-ai-backend"}


