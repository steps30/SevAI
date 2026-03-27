# ------------------------------------------
# IMPORTS
# ------------------------------------------
from datetime import datetime
from duplicate_test import duplicate_score


# ------------------------------------------
# CATEGORY SCORE
# ------------------------------------------
def category_score(text):
    text = text.lower()

    if "water" in text:
        return 1.0
    elif "garbage" in text:
        return 0.8
    elif "light" in text or "electric" in text:
        return 0.9
    elif "road" in text or "pothole" in text:
        return 0.85
    else:
        return 0.5


# ------------------------------------------
# SENTIMENT SCORE
# ------------------------------------------
def sentiment_score(text):
    urgent_words = ["urgent", "immediately", "danger", "serious", "accident"]

    score = 0
    for word in urgent_words:
        if word in text.lower():
            score += 1

    return min(score / len(urgent_words), 1.0)


# ------------------------------------------
# TIME ESCALATION SCORE
# ------------------------------------------
def time_score(created_at):
    """
    created_at: datetime object
    returns: score between 0–1
    """

    hours = (datetime.now() - created_at).total_seconds() / 3600

    if hours < 24:
        return 0.1
    elif hours < 72:
        return 0.3
    elif hours < 168:
        return 0.6
    elif hours < 336:
        return 0.8
    else:
        return 1.0


# ------------------------------------------
# PRIORITY LABEL
# ------------------------------------------
def priority_label(score):
    if score < 0.3:
        return "Low"
    elif score < 0.55:
        return "Medium"
    elif score < 0.75:
        return "High"
    else:
        return "Critical"


# ------------------------------------------
# FINAL PRIORITY FUNCTION
# ------------------------------------------
def get_priority(text, area, created_at):
    """
    text       : complaint text
    area       : ward / location
    created_at : datetime of complaint
    """

    # 1️⃣ Category
    cat_score = category_score(text)

    # 2️⃣ Sentiment
    sent_score = sentiment_score(text)

    # 3️⃣ Duplicate detection
    dup_score, dup_type = duplicate_score(text, area)

    # 4️⃣ Time escalation
    t_score = time_score(created_at)

    # 5️⃣ Final weighted score
    final_score = (
        0.35 * cat_score +
        0.20 * sent_score +
        0.25 * dup_score +
        0.20 * t_score
    )

    final_score = round(final_score, 3)

    # 6️⃣ Priority label
    label = priority_label(final_score)

    # 7️⃣ Return result
    return {
        "CategoryScore": round(cat_score, 3),
        "SentimentScore": round(sent_score, 3),
        "DuplicateScore": round(dup_score, 3),
        "DuplicateType": dup_type,
        "TimeScore": round(t_score, 3),
        "FinalScore": final_score,
        "Priority": label
    }


# ------------------------------------------
# TEST FUNCTION
# ------------------------------------------
if __name__ == "__main__":

    print("\n--- PRIORITY TEST ---")

    text = input("Enter complaint: ")
    area = input("Enter area: ")

    # simulate new complaint
    created_at = datetime.now()

    result = get_priority(text, area, created_at)

    print("\n--- RESULT ---")
    for key, value in result.items():
        print(f"{key}: {value}")
