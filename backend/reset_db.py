from pymongo import MongoClient

# Connect to local MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Select your database (change 'test' if you named it something else)
db = client.grievance_system

# Delete ALL documents inside the complaints collection
result = db.complaints.delete_many({})

print(f"Great Reset Complete! Deleted {result.deleted_count} complaints.")