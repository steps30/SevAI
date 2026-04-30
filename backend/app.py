from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo  # Essential for the 'mongo' object
from werkzeug.security import generate_password_hash, check_password_hash # Essential for Security
import uuid
import pymongo
import random
import jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from models.nlp import get_text_category
from models.image import analyze_image_yolo
from models.duplicate import calculate_semantic_duplicate_points # UPDATED IMPORT
from utils.priority_engine import calculate_priority_index, authenticity_handshake
from models.timeEscalation import calculate_time_points
from auth.adminAccounts import admin_accounts

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb://localhost:27017/grievance_system"
mongo = PyMongo(app)

print(f"✅ APP IS TRYING TO CONNECT TO DATABASE: {mongo.db.name}")

# Ensure offline 2dsphere index for YOLO/Duplicate matching
try:
    mongo.db.complaints.create_index([("location", pymongo.GEOSPHERE)])
    print("MongoDB 2dsphere index ensured for offline $near queries.")
except Exception as e:
    print(f"Index creation warning: {e}")


@app.route('/')
def home():
    return "Local Backend Running"

# Production Keys
SECRET_KEY = "sevai-super-secret-production-key-2026"
SYSTEM_EMAIL = "stephanas306@gmail.com"  # Put your Gmail here
SYSTEM_APP_PASSWORD = "aqxk cidq fsep vorb" 

otp_store = {}

def send_email_otp(target_email, otp_code, subject_type):
    """Helper function to send the actual email"""
    try:
        msg = MIMEMultipart()
        msg['From'] = f"SevAI Security <{SYSTEM_EMAIL}>"
        msg['To'] = target_email
        msg['Subject'] = f"SevAI {subject_type} Code"
        
        body = f"Your 6-digit SevAI verification code is: {otp_code}\n\nThis code expires in 5 minutes."
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SYSTEM_EMAIL, SYSTEM_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"❌ EMAIL FAILED: {e}")
        return False

# ==========================================
# 1. STANDARD LOGIN (Email + Password)
# ==========================================
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    user = mongo.db.users.find_one({"email": email})
    
    # Check if user exists AND password hash matches
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        "userId": user["userId"],
        "email": user["email"],
        "role": user.get("role", "citizen"),
        "exp": datetime.utcnow() + timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"success": True, "token": token, "user": {"name": user["name"], "email": user["email"]}})

# ==========================================
# 2. SIGN UP: REQUEST OTP
# ==========================================
@app.route('/api/auth/signup/request-otp', methods=['POST'])
def signup_request_otp():
    email = request.json.get("email", "").lower().strip()
    
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "An account with this email already exists."}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = {"otp": otp, "expires": datetime.utcnow() + timedelta(minutes=5)}
    
    if send_email_otp(email, otp, "Registration"):
        return jsonify({"success": True, "message": "OTP sent to email!"})
    return jsonify({"error": "Failed to send email gateway."}), 500

# ==========================================
# 3. SIGN UP: VERIFY OTP & CREATE ACCOUNT
# ==========================================
@app.route('/api/auth/signup/verify', methods=['POST'])
def signup_verify():
    data = request.json
    email = data.get("email", "").lower().strip()
    user_otp = data.get("otp", "")
    password = data.get("password", "")
    name = data.get("name", "Citizen")

    stored = otp_store.get(email)
    if not stored or stored["otp"] != user_otp or datetime.utcnow() > stored["expires"]:
        return jsonify({"error": "Invalid or expired OTP"}), 401

    del otp_store[email]

    # Create user with an ENCRYPTED password
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user = {
        "userId": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "password": hashed_password,
        "role": "citizen",
        "created_at": datetime.utcnow()
    }
    mongo.db.users.insert_one(user)

    token = jwt.encode({"userId": user["userId"], "email": email, "role": "citizen", "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm="HS256")
    return jsonify({"success": True, "token": token, "user": {"name": name, "email": email}})

# ==========================================
# 4. FORGOT PASSWORD (Request OTP + Reset)
# ==========================================
@app.route('/api/auth/forgot/request-otp', methods=['POST'])
def forgot_request_otp():
    email = request.json.get("email", "").lower().strip()
    if not mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "No account found with that email."}), 404

    otp = str(random.randint(100000, 999999))
    otp_store[email] = {"otp": otp, "expires": datetime.utcnow() + timedelta(minutes=5)}
    
    send_email_otp(email, otp, "Password Reset")
    return jsonify({"success": True})

@app.route('/api/auth/forgot/reset', methods=['POST'])
def forgot_reset():
    data = request.json
    email = data.get("email", "").lower().strip()
    user_otp = data.get("otp", "")
    new_password = data.get("newPassword", "")

    stored = otp_store.get(email)
    if not stored or stored["otp"] != user_otp or datetime.utcnow() > stored["expires"]:
        return jsonify({"error": "Invalid or expired OTP"}), 401

    del otp_store[email]
    
    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    mongo.db.users.update_one({"email": email}, {"$set": {"password": hashed_password}})
    
    return jsonify({"success": True, "message": "Password reset successfully!"})

@app.route('/submit', methods=['POST'])
def submit_complaint():
    """
    Offline POST route analyzing images and text locally.
    Generates Priority Index based purely on ML scripts running on this machine.
    """
    
    # 1. Catch the raw data from React (Including the new UI fields!)
    complaint_text = request.form.get("complaint_text", request.form.get("complaint", ""))
    name = request.form.get("name", "Citizen")
    phone = request.form.get("phone", "")
    email = request.form.get("email", "")       # Critical for My Complaints UI
    street = request.form.get("street", "")     # Critical for Dashboard UI
    area = request.form.get("area", "")         # Critical for Dashboard UI
    pin = request.form.get("pin", "")           # Critical for Dashboard UI
    
    raw_lat = request.form.get("lat")
    raw_lng = request.form.get("lng")
    
    # Fallback for JSON requests (though images require FormData)
    if request.is_json:
        data = request.json
        complaint_text = data.get("complaint_text", data.get("complaint", ""))
        name = data.get("name", "Citizen")
        phone = data.get("phone", "")
        email = data.get("email", "")
        street = data.get("street", "")
        area = data.get("area", "")
        pin = data.get("pin", "")
        raw_lat = data.get("lat")
        raw_lng = data.get("lng")

    if not complaint_text:
        return jsonify({"error": "Complaint text required"}), 400

    # 2. Convert coordinates to floats
    try:
        lat = float(raw_lat)
        lng = float(raw_lng)
    except (TypeError, ValueError):
        return jsonify({"error": "Valid GPS coordinates are required"}), 400

    # 3. Build the GeoJSON Location
    location_obj = {
        "type": "Point",
        "coordinates": [lng, lat]  
    }

    trackingId = f"SEV-{str(uuid.uuid4().hex[:6]).upper()}"
    created_time = datetime.utcnow()

    # 4. Run your local AI models
    nlp_results = get_text_category(complaint_text)
    ai_department = nlp_results.get("department", "General Administration")
    text_hazard_category = nlp_results.get("hazard_category", "GENERAL")

    image_file = request.files.get("image")
    vision_results = analyze_image_yolo(image_file) if image_file else {}
    image_category = vision_results.get("image_category", "GENERAL")
    severity_score = vision_results.get("severity_score", 0.0)

    # 5. Run SBERT Semantic + Geospatial Duplicate Detection
    duplicate_points, is_duplicate = calculate_semantic_duplicate_points(complaint_text, location_obj)

    # --- Force strip all invisible spaces and force uppercase for Handshake ---
    clean_text_cat = str(text_hazard_category).strip().upper()
    clean_image_cat = str(image_category).strip().upper()

    # 6. Calculate Handshake & Priority using the cleaned variables
    auth_mult = authenticity_handshake(clean_text_cat, clean_image_cat)
    priority = calculate_priority_index(
        severity_score=severity_score,
        text_category=clean_text_cat, 
        image_category=clean_image_cat,
        duplicate_points=duplicate_points,
        time_points=0.0
    )

    # 7. Save everything to MongoDB (Matches React expectations exactly)
    complaint_data = {
        "trackingId": trackingId,
        "name": name,
        "phone": phone,
        "email": email,              # FIXED: Required for filtering "My Complaints"
        "street": street,            # FIXED: Required for Dashboard addresses
        "area": area,                
        "pin": pin,                  
        "lat": lat,                  # Flat lat/lng for map plotting
        "lng": lng,                  
        "department": ai_department, 
        "complaint": complaint_text,
        "text_category": text_hazard_category, 
        "image_category": image_category,
        "location": location_obj,    # GeoJSON for MongoDB $near searches
        "is_authentic": (auth_mult == 1.0),
        "auth_multiplier": auth_mult,
        "severity_score": severity_score,
        "is_duplicate": is_duplicate, # Flagged by SBERT
        "duplicate_points": duplicate_points,
        "base_priority": priority, 
        "priority": priority, 
        "created_at": created_time,
        "status": "Pending",
    }

    print(f"Saving to Local DB: {trackingId} | Handshake Mult: {auth_mult}")
    mongo.db.complaints.insert_one(complaint_data)

    return jsonify({
        "message": "Complaint submitted successfully!",
        "trackingId": trackingId,
        "priority": priority,
        "department_routed": ai_department,
        "text_category": text_hazard_category,
        "image_category": image_category,
        "is_authentic": (auth_mult == 1.0)
    }), 201


@app.route('/admin', methods=['GET'])
def get_complaints():
    # 1. Get filter params from the request (sent by React)
    role = request.args.get('role')
    admin_dept = request.args.get('department')
    
    # 2. Build the query: Main Admin sees all, Dept Admin sees only their department
    query = {}
    if role != 'main_admin' and admin_dept:
        query = {"department": admin_dept}

    cursor = mongo.db.complaints.find(query, {"_id": 0})
    complaints = list(cursor)
    
    # Run absolute Python processing over all active records for Live Scoring
    for comp in complaints:
        if comp.get("status") in ["Resolved", "Closed"]:
            # Reconstruct to previously frozen max calculation
            comp["priority"] = comp.get("base_priority", 0)
            comp["time_points"] = 0
            continue
            
        time_pts = calculate_time_points(comp["created_at"])
        
        live_priority = calculate_priority_index(
            severity_score=comp.get("severity_score", 0),
            text_category=comp.get("text_category", ""),
            image_category=comp.get("image_category", ""),
            duplicate_points=comp.get("duplicate_points", 0),
            time_points=time_pts
        )
        
        comp["time_points"] = time_pts
        comp["priority"] = live_priority

    # Sort descending by updated priority mathematics
    complaints.sort(key=lambda x: x.get("priority", 0), reverse=True)

    return jsonify(complaints)

@app.route('/api/get-dept-admins/<department>', methods=['GET'])
def get_dept_admins(department):
    # This filters your hardcoded admin list by department
    matching_admins = [a for a in admin_accounts if a['department'] == department]
    return jsonify(matching_admins)

@app.route('/update/<trackingId>', methods=['PUT'])
def update_complaint(trackingId):
    data = request.json
    mongo.db.complaints.update_one({"trackingId": trackingId}, {"$set": data})
    return jsonify({"message": "Updated successfully offline."})



if __name__ == "__main__":
    app.run(debug=True, port=5001)