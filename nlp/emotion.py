from transformers import pipeline

# Load emotion model
emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

def analyze_emotion(text):

    result = emotion_model(text)[0]

    emotion = result['label']
    confidence = result['score']

    # Assign priority based on emotion
    if emotion in ["anger", "disgust"]:
        priority = "HIGH"
        score = 2

    elif emotion in ["sadness", "fear"]:
        priority = "MEDIUM"
        score = 1

    else:
        priority = "LOW"
        score = 0

    return emotion, priority, score, round(confidence, 3)

complaint = input("Enter complaint:")

emotion, priority, score, confidence = analyze_emotion(complaint)

print("Complaint:", complaint)
print("Emotion:", emotion)
print("Priority:", priority)
print("Score:", score)
print("Confidence:", confidence)