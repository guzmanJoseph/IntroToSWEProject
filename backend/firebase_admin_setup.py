import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_KEY_PATH = os.path.join(BASE_DIR, "serviceAccountKey.json")

if os.path.exists(LOCAL_KEY_PATH):
    # Local development
    cred = credentials.Certificate(LOCAL_KEY_PATH)
else:
    # Render / Production
    google_creds = os.environ.get("GOOGLE_CREDENTIALS")
    if not google_creds:
        raise Exception("GOOGLE_CREDENTIALS environment variable is missing")

    cred = credentials.Certificate(json.loads(google_creds))

firebase_admin.initialize_app(cred)
db = firestore.client()
