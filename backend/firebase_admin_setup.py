import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(r"C:\Users\josep\OneDrive\Desktop\IntroToSWEProject\backend\serviceAccountKey.json")
firebase_admin.initialize_app(cred)


db = firestore.client()
