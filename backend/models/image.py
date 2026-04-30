import os
import cv2
import numpy as np
from ultralytics import YOLO

class LocalVisionModel:
    def __init__(self):
        model_path = "best.pt"
        
        if not os.path.exists(model_path):
            print(f"[WARNING] Vision model '{model_path}' not found. Ensure it is in the backend directory.")
            self.model = None
        else:
            print(f"[INIT] Loading YOLO model from {model_path}...")
            self.model = YOLO(model_path)
        
        self.yolo_classes = {
            0: "Damaged Road issues",
            1: "Pothole Issues",
            2: "Illegal Parking Issues",
            3: "Broken Road Sign Issues",
            4: "Fallen trees",
            5: "Littering/Garbage on Public Places",
            6: "Vandalism Issues",
            7: "Dead Animal Pollution",
            8: "Damaged concrete structures",
            9: "Damaged Electric wires and poles"
        }
        
        self.class_map = {
            "Damaged Road issues": "ROAD_HAZARD",
            "Pothole Issues": "ROAD_HAZARD",
            "Broken Road Sign Issues": "ROAD_HAZARD",
            "Damaged concrete structures": "ROAD_HAZARD",
            "Fallen trees": "GARBAGE_DUMP",
            "Littering/Garbage on Public Places": "GARBAGE_DUMP",
            "Dead Animal Pollution": "GARBAGE_DUMP",
            "Damaged Electric wires and poles": "ELECTRICITY_ISSUE",
            "Illegal Parking Issues": "GENERAL",
            "Vandalism Issues": "GENERAL"
        }

    def analyze(self, image_file) -> dict:
        if not image_file or image_file.filename == '':
            return {"image_category": "GENERAL", "severity_score": 0.0}
        
        if self.model is None:
            return {"image_category": "GENERAL", "severity_score": 0.0}

        try:
            file_bytes = np.frombuffer(image_file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"image_category": "GENERAL", "severity_score": 0.0}

            height, width, _ = img.shape
            total_image_area = height * width

            results = self.model(img)
            
            if not results or len(results[0].boxes) == 0:
                return {"image_category": "GENERAL", "severity_score": 0.0}

            best_class_id = 0
            max_dar = 0.0
            
            for box in results[0].boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                box_area = (x2 - x1) * (y2 - y1)
                dar = (box_area / total_image_area) * 100
                
                if dar > max_dar:
                    max_dar = dar
                    best_class_id = int(box.cls[0].item())

            yolo_label = self.yolo_classes.get(best_class_id, "GENERAL")
            handshake_category = self.class_map.get(yolo_label, "GENERAL")
            final_severity = min(max_dar, 100.0)

            print(f"[VISION] Detected: '{yolo_label}' -> Mapped: {handshake_category} | Severity: {final_severity:.2f}%")
            
            image_file.seek(0)

            return {
                "image_category": handshake_category,
                "severity_score": round(final_severity, 2)
            }

        except Exception as e:
            print(f"[ERROR] Vision processing failure: {e}")
            return {"image_category": "GENERAL", "severity_score": 0.0}

_vision_model = None

def analyze_image_yolo(image_file) -> dict:
    global _vision_model
    if _vision_model is None:
        _vision_model = LocalVisionModel()
    return _vision_model.analyze(image_file)