from flask import Flask, request, jsonify
import json
from datetime import datetime
from firebase_admin_setup import db
from user_creation import create_user, get_user, update_user, delete_user

"""
Eventually, I want to change the logic so the method takes in a json file and adds that to the firebase, so far the method is able to 
read a local json file and add it to the firebase
"""

# users are able to add listings by adding in a json file
def add_listings(file_path):
   with open(file_path, "r") as file:
    data = json.load(file)
    data["createdAt"] = datetime.utcnow()

    db.collection("listings").add(data)
    print("Should work?")

"""
At some point, I want to be able to filter through the listings based on what the user searches for, make separate functions for this
and display the results to the back-end and the front-end
"""

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

# Initialize Flask app
app = Flask(__name__)

# User management endpoints
@app.route('/api/users', methods=['POST'])
def create_user_endpoint():
    """Create a new user"""
    try:
        user_data = request.get_json()
        result = create_user(user_data)
        return jsonify(result), 200 if result['success'] else 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user_endpoint(user_id):
    """Get user by ID"""
    try:
        result = get_user(user_id)
        return jsonify(result), 200 if result['success'] else 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user_endpoint(user_id):
    """Update user by ID"""
    try:
        update_data = request.get_json()
        result = update_user(user_id, update_data)
        return jsonify(result), 200 if result['success'] else 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user_endpoint(user_id):
    """Delete user by ID"""
    try:
        result = delete_user(user_id)
        return jsonify(result), 200 if result['success'] else 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == "__main__":
  # add_listings("backend/test_listing.json")
  # read_listings()
  app.run(debug=True, port=5000)