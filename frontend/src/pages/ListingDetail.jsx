import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userListings, setUserListings] = useState([]);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    address: "",
    contactName: "",
    availableFrom: null,
    availableTo: null,
    parking: "",
    furnished: false,
    notes: "",
  });

  // Extract actual ID from URL (might be a slug like "listing-title-ABC123")
  // Try to find a Firebase ID pattern (alphanumeric, typically 20 chars)
  // Or use the last segment if it looks like an ID
  const extractId = (urlId) => {
    if (!urlId) return null;
    // If it's already a simple ID (no dashes), use it
    if (!urlId.includes("-")) return urlId;
    // Try to extract ID from slug format
    const parts = urlId.split("-");
    // Firebase IDs are typically alphanumeric and 20 characters
    // Check if last part looks like an ID
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length >= 10) {
      return lastPart;
    }
    // Otherwise, try to find a segment that looks like an ID
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].length >= 10 && /^[a-zA-Z0-9]+$/.test(parts[i])) {
        return parts[i];
      }
    }
    return urlId; // Fallback to full string
  };
  
  const actualId = extractId(id);

  // Fetch listing if not in route state
  useEffect(() => {
    if (!listing && actualId) {
      loadListing();
    } else if (listing) {
      initializeEditForm();
    }
  }, [actualId, listing]);

  // Load user's listings to check ownership
  useEffect(() => {
    if (user?.email && listing?.id) {
      loadUserListings();
    }
  }, [user?.email, listing?.id]);

  const loadListing = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getListing(actualId);
      setListing(data);
      initializeEditForm(data);
    } catch (err) {
      setError(err.message || "Failed to load listing");
      console.error("Error loading listing:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserListings = async () => {
    if (!user?.email) return;
    try {
      const listings = await api.getUserListings(user.email);
      setUserListings(listings);
    } catch (err) {
      console.error("Error loading user listings:", err);
    }
  };

  const initializeEditForm = (listingData = listing) => {
    if (!listingData) return;
    
    setEditForm({
      title: listingData.title || "",
      price: listingData.price || "",
      address: listingData.address || "",
      contactName: listingData.contactName || "",
      availableFrom: listingData.availableFrom 
        ? new Date(listingData.availableFrom) 
        : null,
      availableTo: listingData.availableTo 
        ? new Date(listingData.availableTo) 
        : null,
      parking: listingData.parking || "",
      furnished: listingData.furnished || false,
      notes: listingData.notes || "",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    initializeEditForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (field, date) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      const updateData = {
        title: editForm.title.trim(),
        price: Number(editForm.price) || 0,
        address: editForm.address.trim(),
        contactName: editForm.contactName.trim(),
        availableFrom: editForm.availableFrom 
          ? editForm.availableFrom.toISOString() 
          : null,
        availableTo: editForm.availableTo 
          ? editForm.availableTo.toISOString() 
          : null,
        parking: editForm.parking,
        furnished: editForm.furnished,
        notes: editForm.notes.trim(),
      };

      const updated = await api.updateListing(actualId, updateData);
      setListing(updated.listing);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update listing");
      console.error("Error updating listing:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");
    
    try {
      await api.deleteListing(actualId);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Failed to delete listing");
      console.error("Error deleting listing:", err);
      setDeleting(false);
    }
  };

  // Check if current user owns this listing
  // Method 1: Check contactEmail field
  const listingEmail = listing?.contactEmail || listing?.contact_email || listing?.email;
  const emailMatch = user?.email && listingEmail && 
    user.email.toLowerCase().trim() === listingEmail.toLowerCase().trim();
  
  // Method 2: Check if listing ID is in user's listings
  const isInUserListings = user?.email && listing?.id && 
    userListings.some(l => l.id === listing.id);
  
  const isOwner = emailMatch || isInUserListings;
  

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="mb-4">{error}</p>
        <Link to="/" className="text-blue-600 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <p className="mb-4">
          This listing was opened directly or the data is not available in route state.
        </p>
        <p className="mb-4">
          Try browsing from the home page so the app can pass the listing data to this page.
        </p>
        <Link to="/" className="text-blue-600 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing ? (
        // Edit Form
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Listing</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Price ($/month)</label>
              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={editForm.contactName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Available From</label>
              <DatePicker
                selected={editForm.availableFrom}
                onChange={(date) => handleDateChange("availableFrom", date)}
                dateFormat="MMMM d, yyyy"
                className="w-full border rounded px-3 py-2"
                isClearable
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Available To</label>
              <DatePicker
                selected={editForm.availableTo}
                onChange={(date) => handleDateChange("availableTo", date)}
                dateFormat="MMMM d, yyyy"
                className="w-full border rounded px-3 py-2"
                isClearable
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Parking</label>
              <select
                name="parking"
                value={editForm.parking}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select an option</option>
                <option value="included">Included</option>
                <option value="additional-fee">Available for Additional Fee</option>
                <option value="none">No Parking</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="furnished"
                checked={editForm.furnished}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="font-semibold">Furnished</label>
            </div>

            <div>
              <label className="block font-semibold mb-1">Notes</label>
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        // View Mode
        <>
          <div className="md:flex md:gap-6">
            <div className="md:flex-1">
              {/* Images */}
              {Array.isArray(listing.images) && listing.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {listing.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${listing.title || "Listing"}-${i}`}
                      className="w-full rounded-lg object-cover mb-2"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={
                    listing.imageUrl ||
                    listing.image ||
                    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={listing.title}
                  className="w-full rounded-lg object-cover"
                />
              )}
            </div>

            <div className="md:flex-1 mt-4 md:mt-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {listing.title || listing.address || "Untitled"}
                  </h1>
                  {listing.price !== undefined && (
                    <p className="text-2xl text-blue-600 font-semibold mb-2">
                      {typeof listing.price === "number"
                        ? `$${listing.price.toLocaleString()}/month`
                        : listing.price}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 font-semibold"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                {listing.address || listing.location}
              </p>

              {listing.furnished !== undefined && (
                <p className="mb-2">
                  <strong>Furnished:</strong> {listing.furnished ? "Yes" : "No"}
                </p>
              )}

              {listing.parking !== undefined && (
                <p className="mb-2">
                  <strong>Parking:</strong> {String(listing.parking)}
                </p>
              )}

              {listing.availableFrom && (
                <p className="mb-2">
                  <strong>Available From:</strong>{" "}
                  {new Date(listing.availableFrom).toLocaleDateString()}
                </p>
              )}
              {listing.availableTo && (
                <p className="mb-4">
                  <strong>Available To:</strong>{" "}
                  {new Date(listing.availableTo).toLocaleDateString()}
                </p>
              )}

              {listing.notes && (
                <div className="mb-4">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-gray-700">{listing.notes}</p>
                </div>
              )}

              {/* Contact info */}
              {(listing.contactName || listing.contactEmail) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p>{listing.contactName}</p>
                  <p className="text-sm text-gray-600">{listing.contactEmail}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link to="/" className="text-blue-600 underline">
              Back to Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
