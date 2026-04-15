import pandas as pd
from datetime import datetime

# ----------------------------
# LOAD DATASET
# ----------------------------

df = pd.read_csv("Sevai_dataset.csv")

df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
df = df.dropna(subset=["created_at"])

print("Dataset loaded successfully")
print("Total complaints:", len(df))


# ----------------------------
# SLA MAPPING
# ----------------------------

SLA_KEYWORDS = {
    "street": 72,
    "light": 72,
    "garbage": 48,
    "unsanitary": 48,
    "water": 24,
    "road": 120,
    "mobility": 120,
    "pollution": 96,
    "animal": 96
}

DEFAULT_SLA = 72


def get_sla(category):
    category = str(category).lower()
    for keyword, hours in SLA_KEYWORDS.items():
        if keyword in category:
            return hours
    return DEFAULT_SLA


# ----------------------------
# TIME ESCALATION FUNCTION
# ----------------------------

def time_escalation(row):

    created_at = row["created_at"]
    status = str(row["complaint_status_title"]).lower()
    category = row.get("category_title", "")

    # If resolved → no escalation
    if status in ["resolved", "closed"]:
        return pd.Series([0.0, "resolved"])

    sla_hours = get_sla(category)

    # 🔥 IMPORTANT CHANGE
    # Instead of using fixed global date,
    # simulate time progression relative to each complaint

    # We simulate complaints aged between 0 and 2 * SLA
    hours_passed = (hash(str(created_at)) % (2 * sla_hours))

    ratio = hours_passed / sla_hours

    # Classification
    if ratio < 0.25:
        level = "new"
    elif ratio < 0.5:
        level = "low"
    elif ratio < 0.75:
        level = "medium"
    elif ratio < 1:
        level = "high"
    else:
        level = "critical"

    score = min(ratio, 1.0)

    return pd.Series([round(score, 3), level])


# ----------------------------
# APPLY TO WHOLE DATASET
# ----------------------------

df[["time_score", "time_level"]] = df.apply(
    time_escalation,
    axis=1
)

print("Time escalation applied successfully")


# ----------------------------
# SAVE UPDATED DATASET
# ----------------------------

df.to_csv("Sevai_with_time_escalation.csv", index=False)

print("Updated dataset saved as Sevai_with_time_escalation.csv")


# ----------------------------
# SHOW DISTRIBUTION
# ----------------------------

print("\nEscalation Level Distribution:\n")
print(df["time_level"].value_counts())


# ----------------------------
# SAMPLE OUTPUT
# ----------------------------

print("\nSample Output:\n")
print(df[[
    "created_at",
    "category_title",
    "complaint_status_title",
    "time_score",
    "time_level"
]].sample(20))