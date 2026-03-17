import pandas as pd
import numpy as np
import torch
import pickle
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# -------------------------------
# Load Dataset
# -------------------------------

df = pd.read_csv("Sevai_dataset.csv")

# Ensure text column exists
if "description" not in df.columns:
    raise ValueError("Dataset must contain a 'description' column")

if "ward_title" not in df.columns:
    raise ValueError("Dataset must contain a 'ward_title' column")

# -------------------------------
# Load Model
# -------------------------------

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

embedder = SentenceTransformer("all-MiniLM-L6-v2", device=device)

# -------------------------------
# Generate or Load Embeddings
# -------------------------------

def generate_embeddings():
    print("Generating embeddings...")

   

if os.path.exists("embeddings.pkl"):
    print("Loading existing embeddings...")
    with open("embeddings.pkl", "rb") as f:
        df["embedding"] = pickle.load(f)
else:
    print("Generating embeddings...")

    embeddings = embedder.encode(
        df["description"].astype(str).tolist(),
        batch_size=16,  # smaller batch for CPU
        normalize_embeddings=True,
        show_progress_bar=True
    )

    df["embedding"] = list(embeddings)

    with open("embeddings.pkl", "wb") as f:
        pickle.dump(df["embedding"], f)

    print("Embeddings generated and saved.")

# -------------------------------
# Duplicate Detection Logic
# -------------------------------

def duplicate_score(new_text, new_area):

    area_df = df[df["ward_title"].str.lower() == new_area.lower()]

    if len(area_df) == 0:
        return 0.0, "new"

    new_embedding = embedder.encode(
        [new_text],
        normalize_embeddings=True
    )

    past_embeddings = np.vstack(area_df["embedding"].values)

    similarities = cosine_similarity(new_embedding, past_embeddings)[0]

    max_score = float(similarities.max())

    if max_score >= 0.90:
        return max_score, "definite"
    elif max_score >= 0.75:
        return max_score, "possible"
    else:
        return max_score, "new"


# -------------------------------
# User Interface
# -------------------------------

def check_duplicate_from_user():
    print("----- Duplicate Complaint Check -----")

    user_text = input("Enter your complaint: ").strip()
    user_area = input("Enter your area / ward: ").strip()

    dup_score, dup_type = duplicate_score(user_text, user_area)

    dup_score = round(dup_score, 3)

    print("\n--- Result ---")
    print(f"Complaint : {user_text}")
    print(f"Area      : {user_area}")
    print(f"Duplicate Score : {dup_score}")
    print(f"Duplicate Type  : {dup_type}")

    if dup_type == "definite":
        print("Action: Merge with existing complaint")
    elif dup_type == "possible":
        print("Action: Send for manual review")
    else:
        print("Action: Register as new complaint")


# -------------------------------
# Run Program
# -------------------------------

if __name__ == "__main__":
    while True:
        check_duplicate_from_user()
        again = input("\nDo you want to check another complaint? (yes/no): ")
        if again.lower() != "yes":
            break