from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

from models.nlp import predict_category, sentiment_score
from models.duplicate import duplicate_score
from models.priority import calculate_priority
from models.timeEscalation import time_score
from models.image import image_severity

from database.db import collection

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return "Backend Running"


@app.route('/submit', methods=['POST'])
def submit_complaint():

    data = request.json

    text = data.get("complaint")
    area = data.get("area")

    if not text:
        return jsonify({"error": "Complaint text required"}), 400

    # 1️⃣ NLP
    category = predict_category(text)
    sentiment = sentiment_score(text)

    # 2️⃣ Duplicate
    dup_score, is_duplicate = duplicate_score(text, area)

    # 3️⃣ Time
    created_time = datetime.now()
    time_val = time_score(created_time)

    # 4️⃣ Image (dummy for now)
    img_score = 0

    # 5️⃣ Priority
    priority = calculate_priority(
        category,
        sentiment,
        dup_score,
        time_val,
        img_score
    )

    # 6️⃣ Save to DB
    complaint_data = {
        "text": text,
        "area": area,
        "category": category,
        "sentiment": sentiment,
        "duplicate_score": dup_score,
        "is_duplicate": is_duplicate,
        "time_score": time_val,
        "image_score": img_score,
        "priority": priority,
        "created_at": created_time,
        "status": "Pending"
    }

    collection.insert_one(complaint_data)

    return jsonify({
        "category": category,
        "sentiment": sentiment,
        "duplicate_score": dup_score,
        "priority": priority
    })


@app.route('/admin', methods=['GET'])
def get_complaints():
    complaints = list(
        collection.find({}, {"_id": 0}).sort("priority", -1)
    )
    return jsonify(complaints)


if __name__ == "__main__":
    app.run(debug=True)
