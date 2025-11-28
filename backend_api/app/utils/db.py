from pymongo import MongoClient

MONGO_URL = "mongodb+srv://priyaanand2005:priya2005@cluster0.rbozl0w.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGO_URL)

db = client["smart_recycling_db"]
chat_collection = db["chat_history"]
files_collection = db["uploaded_files"]
