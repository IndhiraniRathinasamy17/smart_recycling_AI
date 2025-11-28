# nlp_model/classifier.py
# Rule-based classifier with simple heuristics and confidence score.

from typing import Tuple, Dict
import re

KEYWORDS = {
    "biodegradable": [
        "banana", "apple", "peel", "food scrap", "vegetable", "leaf", "tea bag",
        "coffee grounds", "egg shell", "compost", "fruit"
    ],
    "recyclable": [
        "plastic", "bottle", "pet", "glass", "jar", "aluminum", "can", "cardboard",
        "paper", "newspaper", "tin", "metal", "carton","dress","cloth","garments"
    ],
    "e-waste": [
        "phone", "charger", "battery", "laptop", "motherboard", "hard drive",
        "earbud", "adapter", "electronics", "e-waste", "power bank"
    ],
    "hazardous": [
        "paint", "chemical", "cleaner", "pesticide", "solvent", "asbestos",
        "medical", "sharps", "needle", "gasoline", "battery (lithium)", "battery"
    ],
    "non-recyclable": [
        "chip packet", "laminated", "thermocol", "styrofoam", "plastic wrap",
        "used diaper", "tissue", "sanitary", "wet wipes"
    ],
}

def rule_based_classify(text: str) -> Tuple[str, float, str]:
    t = text.lower()
    for cat, words in KEYWORDS.items():
        for w in words:
            if w in t:
                return cat, 0.95, f"matched keyword '{w}'"
    # small heuristics
    if re.search(r"\b(bottle|jar|can|cup)\b", t):
        return "recyclable", 0.9, "common container"
    if re.search(r"\b(battery|li-ion|lithium|power bank)\b", t):
        return "hazardous", 0.99, "battery-like term"
    return "unknown", 0.5, "no rules matched"

def fallback_heuristic(text: str) -> Tuple[str, float, str]:
    t = text.lower()
    if any(x in t for x in ["cloth", "jeans", "tshirt", "fabric", "cotton"]):
        return "recyclable", 0.7, "fabric -> reusable"
    if any(x in t for x in ["food", "peel", "vegetable", "fruit"]):
        return "biodegradable", 0.7, "food-like"
    return "non-recyclable", 0.6, "fallback default"

def classify_waste(item_text: str) -> Dict:
    cat, conf, reason = rule_based_classify(item_text)
    if cat == "unknown":
        cat, conf, reason = fallback_heuristic(item_text)
    return {"category": cat, "confidence": round(conf,2), "reason": reason}
