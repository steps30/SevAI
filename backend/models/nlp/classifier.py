#pip install transformers datasets torch numpy scikit-learn pandas

from transformers import pipeline

# Load zero-shot classification model
department_model = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

# Department labels
DEPARTMENTS = [
    "MAWS - Water supply",
    "PWD - Roads",
    "ENERGY - Electricity",
    "HEALTH - Public health",
    "TRANS - Transport",
    "ENVFOR - Environment"
]

def classify_department(text):

    result = department_model(text, DEPARTMENTS)

    department = result['labels'][0]
    confidence = result['scores'][0]

    return text, department, round(confidence, 3)

complaint=input("Enter complaint:")
complaint, department, confidence = classify_department(complaint)

print("Complaint:", complaint)
print("Department:", department)
print("Confidence:", confidence)