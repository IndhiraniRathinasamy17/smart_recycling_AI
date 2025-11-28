from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.services.nlp_service import generate_upcycling_ideas, find_recycling_shops

router = APIRouter(tags=["NLP"])

class IdeasRequest(BaseModel):
    item: str
    skill_level: Optional[str] = "low"
    tools: Optional[List[str]] = None
    time_limit: Optional[int] = 60
    location: Optional[str] = ""

@router.post("/generate")
async def generate(req: IdeasRequest):
    try:
        res = generate_upcycling_ideas(
            item=req.item,
            skill_level=req.skill_level,
            tools=req.tools or [],
            time_limit=req.time_limit,
            location=req.location
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ShopsRequest(BaseModel):
    location: str
    radius: Optional[int] = 4000

@router.post("/shops")
def shops(req: ShopsRequest):
    res = find_recycling_shops(req.location, radius=req.radius)
    return res
