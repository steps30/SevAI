import transformers
from transformers import pipeline

# Load sentiment model
sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

def analyze_complaint(text):

    result = sentiment_model(text)[0]

    label = result['label']
    confidence = result['score']

    # Convert model labels to sentiment + priority
    if label == "LABEL_0":   # Negative
        sentiment = "Negative"
        priority = "HIGH"
        score = 2

    elif label == "LABEL_1": # Neutral
        sentiment = "Neutral"
        priority = "MEDIUM"
        score = 1

    else:                    # Positive
        sentiment = "Positive"
        priority = "LOW"
        score = 0

    return text, sentiment, priority, score, round(confidence, 3)

complaint=input("Enter complaint:")
complaint, sentiment, priority, score, confidence = analyze_complaint(complaint)

print("Complaint:", complaint)
print("Sentiment:", sentiment)
print("Priority:", priority)
print("Score:", score)
print("Confidence:", confidence)