def predict_category(text):
    text = text.lower()

    if "garbage" in text:
        return "Garbage"
    elif "water" in text:
        return "Water"
    elif "road" in text:
        return "Road"
    elif "electric" in text:
        return "Electricity"
    else:
        return "General"


def sentiment_score(text):
    text = text.lower()

    negative_words = ["bad", "dirty", "broken", "problem", "danger"]

    for word in negative_words:
        if word in text:
            return 2

    return 1
