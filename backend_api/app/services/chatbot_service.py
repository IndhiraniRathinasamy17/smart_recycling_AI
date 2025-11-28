def generate_reply(user_message: str):
    user_message = user_message.lower()

    if "plastic" in user_message:
        return "Plastic should be recycled separately. Use the plastic bin."
    if "paper" in user_message:
        return "Paper is recyclable. Keep it dry and clean."
    if "metal" in user_message:
        return "Metal can be recycled. Deposit in metal waste bins."
    return "I am Smart Recycling AI. How can I help you?"
