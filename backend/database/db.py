from pymongo import MongoClient

# Connect to MongoDB (local server)
client = MongoClient("mongodb://localhost:27017/")

# Create / connect to database
db = client["grievance_system"]

# Create / connect to collection
collection = db["complaints"]