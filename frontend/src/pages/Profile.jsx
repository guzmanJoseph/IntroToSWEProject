import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    university: "University of Florida",
    bio: "",
    profilepic: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: {},
  });
  const [listings, setListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load user profile and listings on mount
  useEffect(() => {
    if (user?.email) {
      loadProfile();
      loadUserListings();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError("");
    try {
      const userData = await api.getUser(user.email);
      
      // Build display name from firstName and lastName
      const displayName = userData.firstName || userData.lastName
        ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
        : userData.email?.split("@")[0] || "User";
      
      setProfile({
        name: displayName,
        email: userData.email || "",
        phone: userData.phone || "",
        university: userData.university || "University of Florida",
        bio: userData.bio || "",
        profilepic: userData.profilepic || "https://www.gatorworldparks.com/wp-content/uploads/2017/10/OpenMouthGator-e1507064516547.jpg",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        gender: userData.gender || "",
        dob: userData.dob || {},
      });
      
      setEditForm({
        name: displayName,
        email: userData.email || "",
        phone: userData.phone || "",
        university: userData.university || "University of Florida",
        bio: userData.bio || "",
        profilepic: userData.profilepic || "https://www.gatorworldparks.com/wp-content/uploads/2017/10/OpenMouthGator-e1507064516547.jpg",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        gender: userData.gender || "",
        dob: userData.dob || {},
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserListings = async () => {
    if (!user?.email) return;
    
    try {
      const userListings = await api.getUserListings(user.email);
      // Transform listings to match the expected format
      const transformedListings = userListings.map((listing) => ({
        id: listing.id,
        title: listing.title || "Untitled Listing",
        price: listing.price ? `$${listing.price.toLocaleString()} / month` : "Price not set",
        image: listing.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
        address: listing.address || "",
        availableFrom: listing.availableFrom || "",
        availableTo: listing.availableTo || "",
        createdAt: listing.createdAt || "",
      }));
      setListings(transformedListings);
    } catch (err) {
      console.error("Error loading user listings:", err);
      // Don't set error state here, just log it
    }
  };

  const handleOpenModal = () => {
    setEditForm({ ...profile });
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
    if (!url) return true; // Allow empty
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (editForm.profilepic && !validateImageUrl(editForm.profilepic)) {
      alert(
        "Please enter a valid image URL (must end with .jpg, .jpeg, .png, .gif, or .webp)"
      );
      return;
    }

    setSaving(true);
    setError("");
    
    try {
      // Split name back into firstName and lastName if needed
      const nameParts = editForm.name?.split(" ") || [];
      const firstName = editForm.firstName || nameParts[0] || "";
      const lastName = editForm.lastName || nameParts.slice(1).join(" ") || "";
      
      const updateData = {
        firstName: firstName,
        lastName: lastName,
        phone: editForm.phone,
        university: editForm.university,
        bio: editForm.bio,
        profilepic: editForm.profilepic,
        gender: editForm.gender,
        dob: editForm.dob,
      };
      
      await api.updateUser(user.email, updateData);
      
      // Reload profile and listings
      await loadProfile();
      await loadUserListings();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-32 pb-20 text-gray-900">
      {error && (
        <div className="w-full max-w-3xl px-6 mb-4">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl text-center relative">
        <img
          src={profile.profilepic}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 shadow-md"
          onError={(e) => {
            e.target.src = "https://www.gatorworldparks.com/wp-content/uploads/2017/10/OpenMouthGator-e1507064516547.jpg";
          }}
        />
        <h2 className="text-3xl font-bold mt-4">{profile.name || profile.email}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <p className="text-gray-500">{profile.university}</p>
        {profile.phone && <p className="text-gray-500 mt-1">{profile.phone}</p>}
        {profile.bio && <p className="text-gray-500 mt-1">{profile.bio}</p>}
        {profile.gender && <p className="text-gray-500 mt-1">Gender: {profile.gender}</p>}

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
                  {listing.address && (
                    <p className="text-sm text-gray-500 mt-1">{listing.address}</p>
                  )}
                  {listing.availableFrom && listing.availableTo && (
                    <p className="text-xs text-gray-400 mt-1">
                      Available: {new Date(listing.availableFrom).toLocaleDateString()} - {new Date(listing.availableTo).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex space-x-3 mt-3">
                    <button 
                      onClick={() => navigate(`/listing/${listing.id}`, { state: { listing } })}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this listing?")) {
                          try {
                            await api.deleteListing(listing.id);
                            await loadUserListings();
                          } catch (err) {
                            alert(`Failed to delete: ${err.message}`);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
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
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition mx-2"
        >
          Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Edit Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
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
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                />
                <small className="text-gray-500">Email cannot be changed</small>
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
                  placeholder="(352) 555-1234"
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
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="nonbinary">Non-Binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
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
                disabled={saving}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
