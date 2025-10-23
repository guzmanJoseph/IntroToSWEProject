from flask import Flask, request, jsonify
from datetime import datetime
from firebase_admin_setup import db
import json

app = Flask(__name__)

# This will touch the client. If the something is wrong like credentials, an error will raise
@app.get("/health")
def health():
    try:
        _ = list(db.collections())
        return jsonify({"status": "ok", "firebase": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "details": str(e)}), 500

######### HELPER FUNCTIONS #########
# users are able to add listings by adding in a json file
def add_listings(file_path):
   with open(file_path, "r") as file:
    data = json.load(file)
    data["createdAt"] = datetime.utcnow()

    db.collection("listings").add(data)
    print("Should work?")

# this method reads all the info from the listings collection
def read_listings():
  try:
    listings_reference = db.collection("listings")
    docs = listings_reference.stream()
    listings = []

    for doc in docs:
      data = doc.to_dict()
      listings.append(data)

    print("All listings in Firebase:\n")
    for listing in listings:
      print(listing)
      print()

  except Exception as e:
    print(e)

######### Listings API #########
# Returns all listing as a JSON array.
@app.get("/listings")
def list_listings():
    docs = db.collection("listings").stream()
    listings = [d.to_dict() for d in docs]
    return jsonify(listings)

# POST /listings. make a "created at" timestampe for consistency
@app.post("/listings")
def create_listing():
    data = request.get_json(force=True)
    data = data or {}
    data["createdAt"] = datetime.utcnow()
    db.collection("listings").add(data)
    return jsonify({"ok": True}), 201

#### AUTHENTICATION ####
@app.post("/auth/register")
def register_user():
  body = request.get_json(force=True) or {}
  email = body.get("email")

  # Basic UF email check
  if not email or not email.endswith("@ufl.edu"):
      return jsonify({"error": "Email must be a @ufl.edu address"}), 400

  # See if a user doc with this email already exists
  existing = db.collection("users").where("email", "==", email).limit(1).get()
  if existing:
      return jsonify({"error": "User already exists"}), 400

  user_doc = {
      "email": email,
      "createdAt": datetime.utcnow()
  }
  db.collection("users").add(user_doc)

  # We return the user data we stored (no doc id here; you can include it later)
  return jsonify({"message": "Registered", "user": user_doc}), 201

@app.post("/auth/login")
def login_user():
  body = request.get_json(force=True) or {}
  email = body.get("email")

  if not email or not email.endswith("@ufl.edu"):
      return jsonify({"error": "Email must be a @ufl.edu address"}), 400

  # Look up that user in Firestore
  found = db.collection("users").where("email", "==", email).limit(1).get()
  if not found:
      return jsonify({"error": "User not found"}), 404

  return jsonify({"message": "Login ok", "user": found[0].to_dict()}), 200


#### Messaging ####
@app.post("/messages")
def send_message():
  body = request.get_json(force=True) or {}
  sender = body.get("sender_email")
  receiver = body.get("receiver_email")
  text = body.get("text")

  if not sender or not receiver or not text:
      return jsonify({"error": "sender_email, receiver_email, and text are required"}), 400

  msg = {
      "sender": sender,
      "receiver": receiver,
      "text": text,
      "timestamp": datetime.utcnow()
  }
  db.collection("messages").add(msg)
  return jsonify({"message": "sent", "data": msg}), 201


@app.get("/messages")
def get_conversation():
  a = request.args.get("sender")
  b = request.args.get("receiver")
  if not a or not b:
      return jsonify({"error": "Query params 'sender' and 'receiver' are required"}), 400

  coll = db.collection("messages")

  # Query 1: messages sent A -> B
  q1 = coll.where("sender", "==", a).where("receiver", "==", b).stream()
  # Query 2: messages sent B -> A
  q2 = coll.where("sender", "==", b).where("receiver", "==", a).stream()

  msgs = [doc.to_dict() for doc in list(q1) + list(q2)]

  msgs.sort(key=lambda m: m.get("timestamp"))

  return jsonify(msgs), 200


if __name__ == "__main__":
  app.run(debug=True)