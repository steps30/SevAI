import os
from transformers import pipeline

class LocalNLPModel:
    def __init__(self):
        self.model_id = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli" 
        self.classifier = pipeline("zero-shot-classification", model=self.model_id)
    
        # Simplified Department Names for better UI matching
        self.departments = [
            "Highways and Public Works Department (Roads, Potholes, Infrastructure, Pavement)",
            "Energy Department (Electricity, Broken Wires, Power Poles, Transformers)",
            "Municipal Administration and Water Supply (Garbage, Dead Animals, Sewage, Water Leaks)",
            "Police Department (Traffic, Law Enforcement, Vandalism, Illegal Parking)" 
        ]

        # Added WATER_ISSUE to Handshake Categories
        self.handshake_categories = [
            "ROAD_HAZARD",       
            "GARBAGE_DUMP",      
            "ELECTRICITY_ISSUE", 
            "WATER_ISSUE",
            "GENERAL"            
        ]

    def analyze(self, text: str) -> dict:
        if not text or not text.strip():
            return {
                "department": self.departments[2], 
                "hazard_category": "GENERAL"
            }
            
        text_lower = text.lower()

        electricity_keywords = ["electric", "electricity", "power", "wire", "transformer", "shock", "pole", "spark", "current", "outage", "மின்சாரம்", "மின்கம்பி", "மின்மாற்றி", "ஷாக்", "மின்கம்பம்", "மின்வெட்டு"]
        if any(word in text_lower for word in electricity_keywords):
            print(f"[OVERRIDE] Triggered Energy Department for: '{text}'")
            return {
                "department": self.departments[1],
                "hazard_category": self.handshake_categories[2] 
            }

        police_keywords = ["police", "illegal", "vandal", "crime", "theft", "violence", "assault", "parking", "traffic", "accident", "bribe", "போலீஸ்", "காவல்", "விபத்து", "திருட்டு", "சட்டம்", "போக்குவரத்து", "லஞ்சம்"]
        if any(word in text_lower for word in police_keywords):
            print(f"[OVERRIDE] Triggered Police Department for: '{text}'")
            return {
                "department": self.departments[3],
                "hazard_category": self.handshake_categories[3] 
            }

        sanitation_keywords = ["garbage", "trash", "waste", "sewage", "drain", "dead animal", "tree", "water leak", "pipe", "drinking water", "smell", "குப்பை", "சாக்கடை", "கழிவுநீர்", "மரம்", "குடிநீர்", "துர்நாற்றம்"]
        if any(word in text_lower for word in sanitation_keywords):
            print(f"[OVERRIDE] Triggered Sanitation/Water Department for: '{text}'")
            return {
                "department": self.departments[2],
                "hazard_category": self.handshake_categories[1] 
            }

        infrastructure_keywords = ["pothole", "road", "pavement", "highway", "bridge", "asphalt", "tar", "concrete", "crack", "சாலை", "குழி", "பள்ளம்", "பாலம்", "நெடுஞ்சாலை"]
        if any(word in text_lower for word in infrastructure_keywords):
            print(f"[OVERRIDE] Triggered Infrastructure Department for: '{text}'")
            return {
                "department": self.departments[0],
                "hazard_category": self.handshake_categories[0] 
            }

        try:
            dept_result = self.classifier(text, self.departments, multi_label=False)
            best_dept = dept_result['labels'][0]

            hazard_result = self.classifier(text, self.handshake_categories, multi_label=False)
            best_hazard = hazard_result['labels'][0]

            print(f"[AI NLP] Read: '{text}'")
            print(f"   ↳ Routed To : {best_dept}")
            print(f"   ↳ AI Hazard : {best_hazard}")
            
            return {
                "department": best_dept,
                "hazard_category": best_hazard
            }
        except Exception as e:
            print(f"[ERROR] NLP Classification error: {e}")
            return {
                "department": self.departments[0], 
                "hazard_category": "GENERAL"
            }

# =====================================================================
# NOTICE HOW THESE LINES ARE PUSHED ALL THE WAY TO THE LEFT MARGIN!
# =====================================================================
_nlp_model = None

def get_text_category(complaint_text: str) -> dict:
    global _nlp_model
    if _nlp_model is None:
        _nlp_model = LocalNLPModel()
    return _nlp_model.analyze(complaint_text)

if __name__ == "__main__":
    print("\n--- Testing English (Should trigger AI) ---")
    print(get_text_category("There is a massive sinkhole causing issues near the main junction."))

    print("\n--- Testing Tamil Override (Should trigger Sanitation) ---")
    print(get_text_category("குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது"))

    print("\n--- Testing Electricity Override (Should trigger Energy) ---")
    print(get_text_category("A fallen electric pole is completely blocking the main road."))