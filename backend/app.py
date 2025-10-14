from flask import Flask, request
import json
from datetime import datetime
from firebase_admin_setup import db

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

if __name__ == "__main__":
  # add_listings("backend/test_listing.json")
  read_listings()