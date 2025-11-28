# nlp_model/safety_rules.py
# Post-generation safety checks and a "do-not-allow" list.

FORBIDDEN_PHRASES = [
    "burn", "melt", "open battery", "open the battery", "puncture battery",
    "cut battery", "ignite", "set on fire", "acid", "solvent", "gasoline",
    "pressurize", "electrocute", "expose to flame", "use lighter", "use torch",
    "disassemble battery", "disassemble phone", "use bleach", "use paint thinner",
    "medical waste", "reuse diaper", "reuse sanitary", "sharps", "needle"
]

def contains_forbidden(text: str) -> bool:
    t = (text or "").lower()
    return any(phrase in t for phrase in FORBIDDEN_PHRASES)

def sanitize_ideas(ideas: list) -> list:
    """
    Remove or flag ideas whose steps contain forbidden phrases.
    Returns a filtered list.
    """
    safe = []
    for idea in ideas:
        bad = False
        # check title, steps and safety_notes
        fields_to_check = [idea.get("title","")] + idea.get("steps",[]) + [idea.get("safety_notes","")]
        joined = " ".join(str(x) for x in fields_to_check)
        if contains_forbidden(joined):
            bad = True
        if not bad:
            safe.append(idea)
    return safe
