from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

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

    complaint = data.get("complaint")
    area = data.get("area")
    name = data.get("name")
    phone = data.get("phone")
    department = data.get("department")
    image = data.get("image", "")

    if not complaint:
        return jsonify({"error": "Complaint text required"}), 400

    # ✅ Generate tracking ID
    trackingId = str(uuid.uuid4())[:8]

    # 1️⃣ NLP
    category = predict_category(complaint)
    sentiment = sentiment_score(complaint)

    # 2️⃣ Duplicate
    dup_score, is_duplicate = duplicate_score(complaint, area)

    # 3️⃣ Time
    created_time = datetime.now()
    time_val = time_score(created_time)

    # 4️⃣ Image
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
    "trackingId": trackingId,
    "name": name,
    "phone": phone,
    "department": department,
    "complaint": complaint,
    "area": area,
    "category": category,
    "sentiment": sentiment,
    "duplicate_score": dup_score,
    "is_duplicate": is_duplicate,
    "time_score": time_val,
    "image_score": img_score,
    "image": image,
    "priority": priority,
    "created_at": created_time,
    "status": "Pending"
    }

    print("Saving to DB:", complaint_data)
    
    collection.insert_one(complaint_data)

    return jsonify({
    "message": "Complaint submitted successfully",
    "trackingId": trackingId,
    "priority": priority
    })


@app.route('/admin', methods=['GET'])
def get_complaints():
    complaints = list(
        collection.find({}, {"_id": 0}).sort("priority", -1)
    )
    return jsonify(complaints)

@app.route('/update/<trackingId>', methods=['PUT'])
def update_complaint(trackingId):
    data = request.json

    collection.update_one(
        {"trackingId": trackingId},
        {"$set": data}
    )

    return jsonify({"message": "Updated successfully"})


if __name__ == "__main__":
    app.run(debug=True)
