from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from firebase_admin_setup import db
import json
import hashlib

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://intro-to-swe-project.vercel.app/"], supports_credentials=True)

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
    listings = []
    for doc in docs:
        listing_data = doc.to_dict()
        listing_data["id"] = doc.id
        # Convert timestamp if present
        if "createdAt" in listing_data and isinstance(listing_data["createdAt"], datetime):
            listing_data["createdAt"] = listing_data["createdAt"].isoformat()
        listings.append(listing_data)
    return jsonify(listings)

# GET /listings/<id> - Get a single listing by ID
@app.get("/listings/<id>")
def get_listing(id):
    """
    Get a single listing by its document ID.
    """
    try:
        doc_ref = db.collection("listings").document(id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Listing not found"}), 404
        
        listing_data = doc.to_dict()
        listing_data["id"] = doc.id
        # Convert timestamp if present
        if "createdAt" in listing_data and isinstance(listing_data["createdAt"], datetime):
            listing_data["createdAt"] = listing_data["createdAt"].isoformat()
        
        return jsonify(listing_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT /listings/<id> - Update a listing
@app.put("/listings/<id>")
def update_listing(id):
    """
    Update a listing by its document ID.
    """
    try:
        body = request.get_json(force=True) or {}
        doc_ref = db.collection("listings").document(id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Listing not found"}), 404
        
        # Update the listing
        updates = {}
        allowed_fields = ["title", "price", "address", "contactName", "contactEmail", 
                         "availableFrom", "availableTo", "parking", "furnished", "notes"]
        
        for field in allowed_fields:
            if field in body:
                updates[field] = body[field]
        
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        
        doc_ref.update(updates)
        
        # Get updated listing
        updated_doc = doc_ref.get()
        listing_data = updated_doc.to_dict()
        listing_data["id"] = updated_doc.id
        if "createdAt" in listing_data and isinstance(listing_data["createdAt"], datetime):
            listing_data["createdAt"] = listing_data["createdAt"].isoformat()
        
        return jsonify({"message": "Listing updated", "listing": listing_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE /listings/<id> - Delete a listing
@app.delete("/listings/<id>")
def delete_listing(id):
    """
    Delete a listing by its document ID.
    """
    try:
        doc_ref = db.collection("listings").document(id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Listing not found"}), 404
        
        doc_ref.delete()
        return jsonify({"message": "Listing deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST /listings. make a "created at" timestampe for consistency
@app.post("/listings")
def create_listing():
    data = request.get_json(force=True)
    data = data or {}
    data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("listings").add(data)
    # Return the created listing with its ID
    listing_data = data.copy()
    listing_data["id"] = doc_ref[1].id
    if isinstance(listing_data.get("createdAt"), datetime):
        listing_data["createdAt"] = listing_data["createdAt"].isoformat()
    return jsonify({"ok": True, "listing": listing_data}), 201

# GET /listings/user/<email> - Get all listings created by a user
@app.get("/listings/user/<email>")
def get_user_listings(email):
    """
    Get all listings created by a specific user (by contactEmail).
    """
    try:
        listings_ref = db.collection("listings")
        docs = listings_ref.where("contactEmail", "==", email).stream()
        
        listings = []
        for doc in docs:
            listing_data = doc.to_dict()
            listing_data["id"] = doc.id
            # Convert timestamp if present
            if "createdAt" in listing_data and isinstance(listing_data["createdAt"], datetime):
                listing_data["createdAt"] = listing_data["createdAt"].isoformat()
            listings.append(listing_data)
        
        # Sort by createdAt, most recent first
        listings.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        
        return jsonify(listings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#### AUTHENTICATION ####
def hash_password(password):
    """Hash password using SHA-256 (for production, use bcrypt or similar)"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/auth/register")
def register_user():
  body = request.get_json(force=True) or {}
  email = body.get("email")
  password = body.get("password")
  firstName = body.get("firstName", "")
  lastName = body.get("lastName", "")
  dob = body.get("dob", {})
  gender = body.get("gender", "")

  # Basic UF email check
  if not email or not email.endswith("@ufl.edu"):
      return jsonify({"error": "Email must be a @ufl.edu address"}), 400

  # Password validation
  if not password or len(password) < 6:
      return jsonify({"error": "Password must be at least 6 characters"}), 400

  # See if a user doc with this email already exists
  existing = db.collection("users").where("email", "==", email).limit(1).get()
  if existing:
      return jsonify({"error": "User already exists"}), 400

  # Hash password before storing
  hashed_password = hash_password(password)

  user_doc = {
      "email": email,
      "password": hashed_password,  # Store hashed password
      "firstName": firstName,
      "lastName": lastName,
      "dob": dob,
      "gender": gender,
      "createdAt": datetime.utcnow()
  }
  doc_ref = db.collection("users").add(user_doc)
  user_doc["id"] = doc_ref[1].id
  # Don't return password in response
  user_response = {k: v for k, v in user_doc.items() if k != "password"}

  return jsonify({"message": "Registered", "user": user_response}), 201

@app.post("/auth/login")
def login_user():
  body = request.get_json(force=True) or {}
  email = body.get("email")
  password = body.get("password")

  if not email or not email.endswith("@ufl.edu"):
      return jsonify({"error": "Email must be a @ufl.edu address"}), 400

  if not password:
      return jsonify({"error": "Password is required"}), 400

  # Look up that user in Firestore
  found = db.collection("users").where("email", "==", email).limit(1).get()
  if not found:
      return jsonify({"error": "Invalid email or password"}), 401

  user_data = found[0].to_dict()
  stored_password = user_data.get("password")
  
  # Verify password
  hashed_input = hash_password(password)
  if stored_password != hashed_input:
      return jsonify({"error": "Invalid email or password"}), 401

  # Don't return password in response
  user_response = {k: v for k, v in user_data.items() if k != "password"}
  user_response["id"] = found[0].id

  return jsonify({"message": "Login ok", "user": user_response}), 200


@app.get("/users/<email>")
def get_user_profile(email):
  """
  Get user profile by email.
  """
  try:
    users = db.collection("users").where("email", "==", email).limit(1).get()
    if not users:
      return jsonify({"error": "User not found"}), 404
    
    user_data = users[0].to_dict()
    user_data["id"] = users[0].id
    # Don't return password
    user_response = {k: v for k, v in user_data.items() if k != "password"}
    # Convert timestamp if present
    if "createdAt" in user_response and isinstance(user_response["createdAt"], datetime):
      user_response["createdAt"] = user_response["createdAt"].isoformat()
    
    return jsonify(user_response), 200
  except Exception as e:
    return jsonify({"error": str(e)}), 500


@app.put("/users/<email>")
def update_user_profile(email):
  """
  Update user profile. Requires email in URL and updated fields in body.
  """
  body = request.get_json(force=True) or {}
  
  try:
    users = db.collection("users").where("email", "==", email).limit(1).get()
    if not users:
      return jsonify({"error": "User not found"}), 404
    
    user_doc = users[0]
    user_data = user_doc.to_dict()
    
    # Update allowed fields (don't allow password or email changes here)
    allowed_fields = ["firstName", "lastName", "dob", "gender", "phone", "bio", "profilepic", "university"]
    updates = {}
    
    for field in allowed_fields:
      if field in body:
        updates[field] = body[field]
    
    # Update password if provided
    if "password" in body and body["password"]:
      if len(body["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
      updates["password"] = hash_password(body["password"])
    
    if not updates:
      return jsonify({"error": "No valid fields to update"}), 400
    
    # Update in Firestore
    user_doc.reference.update(updates)
    
    # Get updated user data
    updated_user = user_doc.reference.get().to_dict()
    updated_user["id"] = user_doc.id
    # Don't return password
    user_response = {k: v for k, v in updated_user.items() if k != "password"}
    
    return jsonify({"message": "Profile updated", "user": user_response}), 200
  except Exception as e:
    return jsonify({"error": str(e)}), 500


@app.post("/listings/filter")
def filter_listings():
    try:
        body = request.get_json(force=True) or {}
        title = body.get("title", "").strip()
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
            try:
                max_price_int = int(max_price)
                query = query.where("price", "<=", max_price_int)
            except (ValueError, TypeError):
                pass  # Skip invalid price

        # Get all results first (Firestore has limitations on multiple where clauses)
        # We'll apply most filters client-side to avoid query complexity
        docs = query.stream()
        results = []
        for doc in docs:
            listing_data = doc.to_dict()
            listing_data["id"] = doc.id
            results.append(listing_data)

        # Apply client-side filters
        
        # Title filter (case-insensitive search)
        if title:
            title_lower = title.lower()
            results = [r for r in results if title_lower in (r.get("title", "") or "").lower()]

        # Furnished filter (handle both boolean True and truthy values)
        if furnished is True:
            results = [r for r in results if r.get("furnished") is True]

        # Parking filter (handle string values like "included", "additional-fee", "none")
        if parking == "yes":
            results = [r for r in results if r.get("parking") in [True, "included", "yes", "available"]]
        elif parking == "no":
            results = [r for r in results if r.get("parking") in [False, "none", "no", None]]

        # Date filtering (using availableFrom and availableTo fields)
        if start_date:
            try:
                start_date_obj = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                results = [r for r in results if r.get("availableFrom")]
                results = [
                    r for r in results 
                    if datetime.fromisoformat(r["availableFrom"].replace("Z", "+00:00")) >= start_date_obj
                ]
            except (ValueError, KeyError, TypeError) as e:
                print(f"Error parsing start_date: {e}")

        if end_date:
            try:
                end_date_obj = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                results = [r for r in results if r.get("availableTo")]
                results = [
                    r for r in results 
                    if datetime.fromisoformat(r["availableTo"].replace("Z", "+00:00")) <= end_date_obj
                ]
            except (ValueError, KeyError, TypeError) as e:
                print(f"Error parsing end_date: {e}")

        # Convert timestamps to ISO strings for JSON serialization
        for r in results:
            if "createdAt" in r and isinstance(r["createdAt"], datetime):
                r["createdAt"] = r["createdAt"].isoformat()

        print(f"Filtered results: {len(results)} listings found")
        return jsonify(results), 200
    except Exception as e:
        print(f"Error in filter_listings: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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




if __name__ == "__main__":
  app.run(debug=True)
