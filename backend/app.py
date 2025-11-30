from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from firebase_admin_setup import db
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

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

# adds the user account information to the database
def add_account(file_path):
   with open(file_path, "r") as file:
    data = json.load(file)
    db.collection("accounts").add(data)
    print("Should work") 

# return true if the users account is found in the database, false otherwise
def found_account(email, password):
   try:
      accounts_reference = db.collection("accounts")
      query = accounts_reference.where("email", "==", email).where("password", "==", password).get()

      if query:
         print("Account Found.")
         return True
      else:
         print("Account not found.")
         return False

   except Exception as e:
      print("Error while checking account:", e)
      return None


######### Listings API #########
# Returns all listing as a JSON array.
@app.get("/listings")
def list_listings():
    docs = (
        db.collection("listings")
          .order_by("createdAt", direction="DESCENDING")
          .limit(20)
          .stream()
    )
    return jsonify([d.to_dict() for d in docs])

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


@app.post("/listings/filter")
def filter_listings():
    body = request.get_json(force=True) or {}
    max_price = body.get("maxPrice")
    furnished = body.get("furnished")
    parking = body.get("parking")
    start_date = body.get("startDate")
    end_date = body.get("endDate")

    coll = db.collection("listings")

    # Start building the query
    query = coll

    # Max price filter
    if max_price:
        query = query.where("price", "<=", int(max_price))

    # Furnished filter
    if furnished is not None:
        query = query.where("furnished", "==", furnished)

    # Parking filter
    if parking == "yes":
        query = query.where("parking", "==", True)
    elif parking == "no":
        query = query.where("parking", "==", False)

    # Firestore requires inequality filters to be on SAME field
    # So we apply date range by filtering results after retrieval
    docs = query.stream()
    results = [doc.to_dict() for doc in docs]

    # Date filtering (client-side)
    if start_date:
        start_date = datetime.fromisoformat(start_date)
        results = [r for r in results if datetime.fromisoformat(r["move_in"]) >= start_date]

    if end_date:
        end_date = datetime.fromisoformat(end_date)
        results = [r for r in results if datetime.fromisoformat(r["move_out"]) <= end_date]

    print("Filtered results:", results)
    return jsonify(results), 200

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
      "timestamp": datetime.utcnow(),
      "read": False
  }
  doc_ref = db.collection("messages").add(msg)
  msg["id"] = doc_ref[1].id
  # Convert timestamp to ISO format string for JSON serialization
  msg["timestamp"] = msg["timestamp"].isoformat()
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

  msgs = []
  for doc in list(q1) + list(q2):
    msg_data = doc.to_dict()
    msg_data["id"] = doc.id
    # Convert timestamp to ISO format string if it's a datetime object
    if isinstance(msg_data.get("timestamp"), datetime):
      msg_data["timestamp"] = msg_data["timestamp"].isoformat()
    msgs.append(msg_data)

  msgs.sort(key=lambda m: m.get("timestamp", ""))

  return jsonify(msgs), 200


@app.get("/messages/conversations")
def get_conversations():
  """
  Get all conversations for a user.
  Returns a list of conversations with the other participant's email and last message.
  """
  user_email = request.args.get("user_email")
  if not user_email:
      return jsonify({"error": "Query param 'user_email' is required"}), 400

  coll = db.collection("messages")
  
  # Get all messages where user is sender or receiver
  all_messages = coll.where("sender", "==", user_email).stream()
  all_messages = list(all_messages) + list(coll.where("receiver", "==", user_email).stream())
  
  # Build a map of other participants to their conversation data
  conversations_map = {}
  
  # First pass: build conversation structure and find last message
  for doc in all_messages:
    msg_data = doc.to_dict()
    other_participant = msg_data["receiver"] if msg_data["sender"] == user_email else msg_data["sender"]
    
    # Convert timestamp if needed
    timestamp = msg_data.get("timestamp")
    if isinstance(timestamp, datetime):
      timestamp = timestamp.isoformat()
    elif hasattr(timestamp, 'isoformat'):
      timestamp = timestamp.isoformat()
    
    # Initialize conversation if needed
    if other_participant not in conversations_map:
      conversations_map[other_participant] = {
        "other_user_email": other_participant,
        "last_message": "",
        "last_timestamp": "",
        "unread_count": 0
      }
    
    # Update last message if this is newer
    current_last = conversations_map[other_participant]["last_timestamp"]
    if not current_last or timestamp > current_last:
      conversations_map[other_participant]["last_message"] = msg_data.get("text", "")
      conversations_map[other_participant]["last_timestamp"] = timestamp
  
  # Second pass: count unread messages for each conversation
  for other_participant in conversations_map.keys():
    unread_query = coll.where("sender", "==", other_participant)\
                       .where("receiver", "==", user_email)\
                       .where("read", "==", False)\
                       .stream()
    conversations_map[other_participant]["unread_count"] = len(list(unread_query))
  
  # Convert to list and sort by last timestamp (most recent first)
  conversations = list(conversations_map.values())
  conversations.sort(key=lambda c: c.get("last_timestamp", ""), reverse=True)
  
  return jsonify(conversations), 200


@app.put("/messages/read")
def mark_messages_read():
  """
  Mark messages as read for a conversation between two users.
  """
  body = request.get_json(force=True) or {}
  user_email = body.get("user_email")
  other_user_email = body.get("other_user_email")
  
  if not user_email or not other_user_email:
      return jsonify({"error": "user_email and other_user_email are required"}), 400

  coll = db.collection("messages")
  
  # Find all unread messages sent to the user from the other user
  unread_messages = coll.where("sender", "==", other_user_email)\
                        .where("receiver", "==", user_email)\
                        .where("read", "==", False)\
                        .stream()
  
  updated_count = 0
  for doc in unread_messages:
    doc.reference.update({"read": True})
    updated_count += 1
  
  return jsonify({"message": "marked as read", "count": updated_count}), 200


@app.get("/users/<email>")
def get_user_by_email(email):
  """
  Get user information by email.
  Useful for getting user names to display in conversations.
  """
  try:
    users = db.collection("users").where("email", "==", email).limit(1).get()
    if not users:
      return jsonify({"error": "User not found"}), 404
    
    user_data = users[0].to_dict()
    user_data["id"] = users[0].id
    # Convert timestamp if present
    if "createdAt" in user_data and isinstance(user_data["createdAt"], datetime):
      user_data["createdAt"] = user_data["createdAt"].isoformat()
    
    return jsonify(user_data), 200
  except Exception as e:
    return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
  app.run(debug=True)