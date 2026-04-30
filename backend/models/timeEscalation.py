from datetime import datetime

def calculate_time_points(upload_time: datetime) -> float:
    """
    Pure math time escalation logic.
    Calculates (current_time - upload_time) and adds penalty points.
    1 hour pending = 0.5 points. Max 30 points.
    """
    if not isinstance(upload_time, datetime):
        return 0.0
        
    try:
        hours_pending = (datetime.utcnow() - upload_time).total_seconds() / 3600.0
        # Give 0.5 points per pending hour, heavily capped at 30
        time_points = min(hours_pending * 0.5, 30.0)
        return max(0.0, time_points)
    except Exception as e:
        print(f"[Time Logic Error] {e}")
        return 0.0
