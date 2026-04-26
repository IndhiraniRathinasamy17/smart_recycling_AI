from flask import Flask, request, jsonify
from flask_cors import CORS
from nlp_model.ai_engine import generate_upcycling_ideas, find_recycling_shops_osm

app = Flask(__name__)
CORS(app)

@app.route("/classify", methods=["POST"])
def classify():
    data = request.json or {}
    item = data.get("item", "").strip()
    skill = data.get("skill", "low")

    if not item:
        return jsonify({"error": "Item is required"}), 400

    result = generate_upcycling_ideas(item, skill_level=skill)
    return jsonify(result)


@app.route("/shops", methods=["POST"])
def get_shops():
    data = request.json or {}
    location = data.get("location", "").strip()

    if not location:
        return jsonify({"error": "Location is required"}), 400

    shops = find_recycling_shops_osm(location)
    return jsonify(shops)


if __name__ == "__main__":
    app.run(debug=True)