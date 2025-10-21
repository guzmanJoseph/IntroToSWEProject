import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CRED_PATH = os.path.join(BASE_DIR, "serviceAccountKey.json")

cred = credentials.Certificate(CRED_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()
