def calculate_priority(category, sentiment, dup_score=0, time_val=0, img_score=0):

    category_weight = {
        "Garbage": 1,
        "Water": 2,
        "Road": 2,
        "Electricity": 3,
        "General": 1
    }

    base = category_weight.get(category, 1)

    final_score = base + sentiment + dup_score + time_val + img_score

    return round(final_score, 2)
