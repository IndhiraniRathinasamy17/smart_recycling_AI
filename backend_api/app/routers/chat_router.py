from fastapi import APIRouter
from app.models.chat import ChatRequest
from app.services.chatbot_service import generate_reply
from app.utils.db import chat_collection

router = APIRouter()

@router.post("/chat")
def chatbot(req: ChatRequest):
    reply = generate_reply(req.message)

    chat_collection.insert_one({
        "user": req.message,
        "bot": reply
    })

    return {"reply": reply}
