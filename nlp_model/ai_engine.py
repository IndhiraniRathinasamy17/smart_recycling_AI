
import os
import json
from typing import Dict, Any
from groq import Groq
from .prompts import SYSTEM_PROMPT
from .classifier import classify_waste
from .safety_rules import sanitize_ideas, contains_forbidden
import requests
import urllib.parse


# Initialize Groq client using environment variable GROQ_API_KEY
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    # Do not raise — let caller handle it, but warn when running interactively
    print("Warning: GROQ_API_KEY is not set. Set it in your environment before calling the engine.")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Choose your model here
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def build_user_prompt(item: str, category_hint: str = "", skill_level: str = "low", tools=None, time_limit:int = 60, location:str = "") -> str:
    tools = tools or []
    return f"""
Item: "{item}"
CategoryHint: "{category_hint}"
UserSkillLevel: "{skill_level}"
ToolsAvailable: "{', '.join(tools) if tools else 'none'}"
TimeAvailable_min: {time_limit}
Location: "{location}"

Using the system instructions, return JSON only in the format specified.
"""

def call_model(prompt_system: str, prompt_user: str) -> str:
    if client is None:
        raise RuntimeError("Groq client not configured. Set GROQ_API_KEY in environment.")
    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": prompt_system},
            {"role": "user", "content": prompt_user}
        ],
        temperature=0.35,
        max_tokens=800
    )
    return resp.choices[0].message.content

def safe_parse_json(raw_text: str) -> Dict[str, Any]:
    """
    Try to extract JSON from model output. Return dict or raise ValueError.
    """
    text = raw_text.strip()
    # remove code fences if present
    if text.startswith("```"):
        parts = text.splitlines()
        # remove first and last line if they are ```
        if parts[0].strip().startswith("```"):
            parts = parts[1:]
        if parts and parts[-1].strip().endswith("```"):
            parts = parts[:-1]
        text = "\n".join(parts).strip()
    # Try direct JSON parse
    try:
        return json.loads(text)
    except Exception:
        # fallback: find first {...} substring
        import re
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception as e:
                raise ValueError(f"Failed to parse JSON from model output. Raw text: {text[:400]}...") from e
        raise ValueError("No JSON found in model output.")

def generate_upcycling_ideas(item: str, skill_level: str="low", tools=None, time_limit:int=60, location:str="") -> Dict[str, Any]:
    """
    Full pipeline:
    1) classify via rule-based classifier
    2) if hazardous/e-waste -> return disposal instructions only
    3) else call LLM to generate JSON. Parse and post-filter unsafe steps.
    """
    tools = tools or []
    classification = classify_waste(item)
    category = classification["category"]
    confidence = classification["confidence"]

    # If clearly hazardous or e-waste -> avoid generation
    if category in ["hazardous", "e-waste"]:
        return {
            "item": item,
            "category": category,
            "confidence": confidence,
            "reason": classification.get("reason",""),
            "ideas": [],
            "disposal_instructions": "This item is hazardous/e-waste. Please do not attempt DIY. Take it to an authorized e-waste/hazardous waste collection center.",
            "environmental_impact_note": "",
            "notes": "classified_by_rule"
        }

    # Prepare prompts
    category_hint = category if confidence >= 0.6 else ""
    user_prompt = build_user_prompt(item, category_hint, skill_level, tools, time_limit, location)

    # call model
    try:
        raw = call_model(SYSTEM_PROMPT, user_prompt)
    except Exception as e:
        # on failure, return fallback safe response
        return {
            "item": item,
            "category": category,
            "confidence": confidence,
            "reason": classification.get("reason",""),
            "ideas": [],
            "disposal_instructions": "Model call failed. Please retry later.",
            "environmental_impact_note": "",
            "notes": f"model_error: {e}"
        }

    try:
        data = safe_parse_json(raw)
    except ValueError as e:
        return {
            "item": item,
            "category": category,
            "confidence": confidence,
            "reason": classification.get("reason",""),
            "ideas": [],
            "disposal_instructions": "Could not parse model output. Raw response included in notes.",
            "environmental_impact_note": "",
            "notes": {"parse_error": str(e), "raw": raw[:1000]}
        }

    # Ensure fields exist
    data.setdefault("item", item)
    data.setdefault("category", category)
    data.setdefault("ideas", [])
    data.setdefault("disposal_instructions", "")
    data.setdefault("environmental_impact_note", "")
    data.setdefault("notes", "")

    # Post-filter ideas for safety
    safe_ideas = sanitize_ideas(data.get("ideas", []))
    if len(safe_ideas) < len(data.get("ideas", [])):
        data["notes"] = (data.get("notes","") or "") + " Some ideas were removed due to safety checks."
    data["ideas"] = safe_ideas[:3]  # limit to max 3 ideas

    # Final safety double-check: if any content contains forbidden phrase reject ideas
    joined = " ".join([json.dumps(i) for i in data["ideas"]]) + " " + str(data.get("disposal_instructions",""))
    if contains_forbidden(joined):
        # if forbidden detected unexpectedly, clear ideas and return disposal recommendation
        return {
            "item": item,
            "category": category,
            "confidence": confidence,
            "reason": classification.get("reason",""),
            "ideas": [],
            "disposal_instructions": "Model output contained unsafe instructions. Do not attempt. Please recycle safely.",
            "environmental_impact_note": data.get("environmental_impact_note",""),
            "notes": "unsafe_output_detected"
        }

    # Attach classifier reason/confidence
    data["confidence"] = confidence
    data["reason"] = classification.get("reason","")
    return data

def geocode_location(location_name):
    """Convert city/location name to lat/lon using Nominatim."""
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": location_name,
            "format": "json",
            "limit": 1
        }
        headers = {"User-Agent": "SmartRecyclingAI/1.0"}

        response = requests.get(url, params=params, headers=headers)
        data = response.json()

        if not data:
            return None

        return float(data[0]["lat"]), float(data[0]["lon"])

    except Exception as e:
        return None


def find_recycling_shops_osm(location_name, radius=4000, max_results=15):
    coords = geocode_location(location_name)
    if not coords:
        return {"error": "Could not find that location on the map."}

    lat, lon = coords
    overpass_url = "https://overpass-api.de/api/interpreter"

    # Your SAME query – unchanged.
    query = f"""
[out:json][timeout:30];
(
  node["amenity"="recycling"](around:{radius},{lat},{lon});
  way["amenity"="recycling"](around:{radius},{lat},{lon});

  node["shop"="scrap"](around:{radius},{lat},{lon});
  way["shop"="scrap"](around:{radius},{lat},{lon});

  node["recycling:electronics"="yes"](around:{radius},{lat},{lon});
  node["shop"="electronics"](around:{radius},{lat},{lon});
  node["shop"="electrical"](around:{radius},{lat},{lon});

  node["recycling:plastic"="yes"](around:{radius},{lat},{lon});
  node["shop"="plastic"](around:{radius},{lat},{lon});

  node["recycling:metal"="yes"](around:{radius},{lat},{lon});
  node["shop"="metal"](around:{radius},{lat},{lon});

  node["shop"="second_hand"](around:{radius},{lat},{lon});
  way["shop"="second_hand"](around:{radius},{lat},{lon});
);
out center;
"""

    try:
        response = requests.post(
            overpass_url,
            data=query,
            headers={"User-Agent": "SmartRecyclingAI/1.0"}
        )

        # FIX 1 — Safe JSON handling
        try:
            data = response.json()
        except:
            return {"error": "Overpass API returned non-JSON. Probably rate-limited. Try again in a few seconds."}

        # FIX 2 — No shops found
        if "elements" not in data or not data["elements"]:
            return {"error": f"No recycling shops found near {location_name}"}

        # FIX 3 — Formatting the results
        shops = []
        for item in data["elements"][:max_results]:
            tags = item.get("tags", {})
            lat2 = item.get("lat") or item.get("center", {}).get("lat")
            lon2 = item.get("lon") or item.get("center", {}).get("lon")

            shops.append({
                "name": tags.get("name", "Recycling Center"),
                "type": tags.get("shop") or tags.get("amenity") or "Recycling",
                "address": tags.get("addr:full") or tags.get("addr:street") or "Address not available",
                "material": tags.get("recycling:material", "N/A"),
                "latitude": lat2,
                "longitude": lon2,
                "maps_link": f"https://www.openstreetmap.org/?mlat={lat2}&mlon={lon2}#map=18"
            })

        return shops

    except Exception as e:
        return {"error": str(e)}



if __name__ == "__main__":
    print("Welcome to the Smart Recycling AI Engine!\n")

    # Step 1: Ask for item and skill
    item = input("Enter the item you want to classify/upcycle: ").strip()
    skill_level = input("Enter your skill level (low/medium/high) [default: low]: ").strip() or "low"

    # Step 2: Generate AI-driven upcycling ideas
    result = generate_upcycling_ideas(item, skill_level=skill_level)

    print("\n=== Upcycling Results ===")
    print(json.dumps(result, indent=2))

    # Step 3: Ask the user if they want nearby recycling shops (always)
    need_shops = input("\nDo you need nearby recycling shops? (yes/no): ").strip().lower()

    if need_shops in ["yes", "y"]:
        location_name = input("Enter your city or location: ").strip()
        shops = find_recycling_shops_osm(location_name)  # same function, just location-based

        print("\n=== Nearby Recycling Shops ===")
        if isinstance(shops, list):
            for s in shops:
                print("\nName:", s["name"])
                print("Type:", s["type"])
                print("Address:", s["address"])
                print("Lat/Lon:", s["latitude"], s["longitude"])
                print("Map:", s["maps_link"])
        else:
            print(shops)
