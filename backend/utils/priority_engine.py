def authenticity_handshake(text_hazard: str, image_hazard: str) -> float:
    """
    Evaluates the 'Handshake' between the NLP inference and YOLO inference.
    Because our NLP is now smart enough to output standard categories, 
    we just need a direct, sanitized comparison.
    """
    if not text_hazard or not image_hazard:
        return 0.5
        
    # Clean the strings perfectly to avoid invisible space errors
    text_clean = str(text_hazard).strip().upper()
    image_clean = str(image_hazard).strip().upper()
    
    # 1. The Perfect Match
    if text_clean == image_clean:
        return 1.0 
        
    # 2. The Safe Fallback
    if "GENERAL" in image_clean:
        return 0.8  # Partial pass if vision couldn't detect anything severe
        
    # 3. The Penalty (Total Mismatch)
    return 0.5 


def calculate_priority_index(
    severity_score: float, 
    text_category: str, 
    image_category: str, 
    duplicate_points: float, 
    time_points: float
) -> float:
    """
    The Local Priority Engine Mathematical Formula:
    Priority Index = (Vision Severity * Authenticity Multiplier) + Duplicate Points + Time Points
    
    Returns a score capped at 100.
    """
    # 1. Run the clean Handshake
    auth_mult = authenticity_handshake(text_category, image_category)
    
    # 2. Base calculation
    priority = (severity_score * auth_mult) + duplicate_points + time_points
    
    # Cap to a maximum of 100
    return min(priority, 100.0)