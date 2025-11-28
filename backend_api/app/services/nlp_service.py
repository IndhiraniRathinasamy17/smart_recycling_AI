import os
from typing import List, Dict, Any

# import the nlp_model package functions if available
try:
    from ml_model.predict import generate_upcycling_ideas as _generate
    from ml_model.predict import find_recycling_shops_osm as _find_shops
    NLP_AVAILABLE = True
except Exception:
    NLP_AVAILABLE = False
    _generate = None
    _find_shops = None

def generate_upcycling_ideas(item: str, skill_level: str="low", tools: List[str]=None, time_limit:int=60, location:str="") -> Dict[str, Any]:
    tools = tools or []
    if NLP_AVAILABLE:
        return _generate(item=item, skill_level=skill_level, tools=tools, time_limit=time_limit, location=location)
    # fallback simple response
    return {
        "item": item,
        "category": "unknown",
        "confidence": 0.5,
        "ideas": [
            {
                "title": "Simple reuse",
                "difficulty": 1,
                "time_minutes": 10,
                "materials_needed": [item],
                "steps": ["Clean the item", "Use as-is or repurpose carefully"],
                "safety_notes": ""
            }
        ],
        "disposal_instructions": "Take to local recycling center if unsure",
        "environmental_impact_note": "",
        "notes": "NLP engine not available; returned fallback ideas."
    }

def find_recycling_shops(location_name: str, radius: int = 4000):
    if NLP_AVAILABLE:
        return _find_shops(location_name, radius=radius)
    return {"error": "NLP/geolocation engine not available on this host."}
