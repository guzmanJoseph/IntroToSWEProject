import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import { useState } from "react";
import { api } from "../api";

export default function Profile() {
  const [user, setUser] = useState({
    name: "John Gator",
    email: "johngator@ufl.edu",
    phone: "(352) 555-1234",
    university: "University of Florida",
    bio: "Gator enthusiast and computer science student.",
    profilepic:
      "https://www.gatorworldparks.com/wp-content/uploads/2017/10/OpenMouthGator-e1507064516547.jpg",
  });

  const [listings] = useState([
    {
      id: 1,
      title: "The Standard - 2 Bed / 2 Bath",
      price: "$1,200 / month",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 2,
      title: "Hub Gainesville - Studio",
      price: "$980 / month",
      image:
        "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=60",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  const handleOpenModal = () => {
    setEditForm(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateImageUrl = (url) => {
    try {
      new URL(url); // Check if valid URL format
      // Check if URL contains an image extension (even with query params)
      return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (editForm.profilepic && !validateImageUrl(editForm.profilepic)) {
      alert(
        "Please enter a valid image URL (must end with .jpg, .jpeg, .png, .gif, or .webp)"
      );
      return;
    }
    setUser(editForm);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-32 pb-20 text-gray-900">
      {/* Profile Header */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl text-center relative">
        <img
          src={user.profilepic}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 shadow-md"
        />
        <h2 className="text-3xl font-bold mt-4">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-500">{user.university}</p>
        <p className="text-gray-500 mt-1">{user.phone}</p>
        <p className="text-gray-500 mt-1">{user.bio}</p>

        <button
          onClick={handleOpenModal}
          className="mt-6 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
        >
          Edit Profile
        </button>
      </div>

      {/* My Listings Section */}
      <div className="w-full max-w-5xl mt-12 px-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b-2 border-orange-400 pb-2">
          My Listings
        </h3>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-lg">{listing.title}</h4>
                  <p className="text-gray-600">{listing.price}</p>
                  <div className="flex space-x-3 mt-3">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-lg">
            You have no active listings yet.
          </p>
        )}
      </div>

      {/* Saved Listing Section */}
      <div className="w-full max-w-5xl mt-12 px-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b-2 border-orange-400 pb-2">
          Saved Listings
        </h3>
        <p className="text-gray-500 text-lg">You have no saved listings yet.</p>
      </div>

      {/* Account Actions */}
      <div className="w-full max-w-3xl mt-12 text-center">
        <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition mx-2">
          Change Password
        </button>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition mx-2">
          Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Edit Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  University
                </label>
                <input
                  type="text"
                  name="university"
                  value={editForm.university}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Bio
                </label>
                <input
                  type="text"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  name="profilepic"
                  value={editForm.profilepic}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded-lg px-3 py-2"
                />
                {editForm.profilepic && (
                  <div className="mt-3">
                    <p className="text-gray-600 font-medium mb-2">Preview:</p>
                    <img
                      src={editForm.profilepic}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                      onError={() => console.log("Image failed to load")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
