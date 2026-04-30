import pymongo
from sentence_transformers import SentenceTransformer, util
from database.db import collection  # Ensure this points to your MongoDB complaints collection

# ==========================================
# 1. LOAD AI MODEL (Loads once on server start)
# ==========================================
print("Loading SBERT Semantic Model for duplicate detection...")
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
print("SBERT Model Loaded!")

# ==========================================
# 2. HYBRID DUPLICATE ENGINE
# ==========================================
def calculate_semantic_duplicate_points(new_text: str, location_obj: dict) -> tuple[float, bool]:
    """
    Combines MongoDB Geospatial ($near) and SBERT Semantic duplicate detection.
    Finds complaints within 50 meters, then checks if the text meaning is >80% similar.
    
    Args:
        new_text (str): The actual complaint description written by the citizen.
        location_obj (dict): GeoJSON point dictionary.
        
    Returns: 
        duplicate_points (float): 5 points per duplicate, max 20.
        is_duplicate (bool): True if at least one semantic duplicate is found.
    """
    if not new_text or not location_obj:
        return 0.0, False

    duplicate_points = 0.0
    is_duplicate = False

    try:
        # Step A: Geospatial Query - Find complaints within 50 meters
        # Note: We NO LONGER filter by text_category. We want the AI to read the raw text!
        nearby_cursor = collection.find({
            "location": {
                "$near": {
                    "$geometry": location_obj,
                    "$maxDistance": 50  
                }
            }
        }).limit(10) # Limit to 10 to keep AI processing lightning fast
        
        nearby_complaints = list(nearby_cursor)
        
        if not nearby_complaints:
            return 0.0, False

        # Step B: Semantic AI Analysis - Compare text meanings
        new_embedding = sbert_model.encode(new_text)
        semantic_duplicate_count = 0
        
        for complaint in nearby_complaints:
            # Extract the actual description from the previous complaints
            existing_text = complaint.get('complaint', '') 
            
            if existing_text:
                existing_embedding = sbert_model.encode(existing_text)
                
                # Calculate Cosine Similarity (1.0 means exactly the same meaning)
                cosine_score = util.cos_sim(new_embedding, existing_embedding).item()
                
                # If similarity is above 80%, the AI believes they are describing the same issue!
                if cosine_score > 0.80:
                    semantic_duplicate_count += 1
                    
        # Step C: Calculate points (Max out at 20 points)
        duplicate_points = min(semantic_duplicate_count * 5.0, 20.0)
        is_duplicate = semantic_duplicate_count > 0
        
        # Terminal Debugging
        print(f"📍 [GEO+AI] Found {len(nearby_complaints)} reports within 50m.")
        if is_duplicate:
            print(f"🧠 [GEO+AI] {semantic_duplicate_count} of those are SEMANTIC duplicates. Added {duplicate_points} priority points.")
        
    except pymongo.errors.OperationFailure as e:
        print(f"⚠️ [GEO] Missing 2dsphere index! Error: {e}")
        # Reminder: Run db.complaints.createIndex({"location": "2dsphere"}) in MongoDB
    except Exception as e:
        print(f"⚠️ [GEO+AI] Detection error: {e}")
        
    return duplicate_points, is_duplicate