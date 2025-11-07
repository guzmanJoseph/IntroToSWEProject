import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useState } from "react";
import "./AddListing.css";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function AddListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [parking, setParking] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [startDate, endDate] = dateRange;

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        price: Number(rent) || 0,
        category: "sublease",
        address: address.trim(),
        contactName: userName.trim(),
        contactEmail: userEmail.trim().toLowerCase(),
        availableFrom: startDate ? startDate.toISOString() : null,
        availableTo: endDate ? endDate.toISOString() : null,
        parking,
        furnished,
        notes: notes.trim(),
      };

      // TEMP logs just to prove it fires (remove later)
      console.log("[add-listing] payload", payload);

      const res = await api.createListing(payload);
      console.log("[add-listing] server response", res);

      setMsg("Listing submitted!");
      // reset
      setTitle(""); setUserName(""); setUserEmail("");
      setAddress(""); setRent(""); setNotes("");
      setDateRange([null, null]); setParking(""); setFurnished(false);
      setTimeout(() => navigate("/"), 400);
    } catch (e2) {
      setErr(e2.message || "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-listing-page">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary">Add a New Listing (TEST)</h1>
          <p className="text-muted">Fill out the details below to post your sublease.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <form className="card shadow-lg p-4 border-0" onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label fw-semibold">Listing Title</label>
                <input id="title" className="form-control" placeholder="e.g 4x4 apartment near UF"
                  value={title} onChange={(e)=>setTitle(e.target.value)} required />
              </div>

              <div className="mb-3">
                <label htmlFor="userName" className="form-label fw-semibold">Your Name</label>
                <input id="userName" className="form-control" placeholder="Enter name here"
                  value={userName} onChange={(e)=>setUserName(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="userEmail" className="form-label fw-semibold">Your Email</label>
                <input type="email" id="userEmail" className="form-control" placeholder="yourname@ufl.edu"
                  value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label fw-semibold">Address of Unit</label>
                <input id="address" className="form-control"
                  placeholder="e.g 123 University Ave, Gainesville, FL, Apt. 603"
                  value={address} onChange={(e)=>setAddress(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="rent" className="form-label fw-semibold">Monthly Rent ($)</label>
                <input type="number" id="rent" className="form-control" placeholder="e.g 1200"
                  value={rent} onChange={(e)=>setRent(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Select the dates you would like to sublease the apartment below.</label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select date range"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="parking" className="form-label fw-semibold">Parking Availability</label>
                <select id="parking" className="form-select"
                  value={parking} onChange={(e)=>setParking(e.target.value)}>
                  <option value="">Select an option</option>
                  <option value="included">Included</option>
                  <option value="additional-fee">Available for Additional Fee</option>
                  <option value="none">No Parking</option>
                </select>
              </div>

              <div className="mb-3 form-check">
                <input type="checkbox" id="furnished" className="form-check-input"
                  checked={furnished} onChange={(e)=>setFurnished(e.target.checked)} />
                <label htmlFor="furnished" className="form-check-label fw-semibold">Furnished</label>
              </div>

              <div className="mb-3">
                <label htmlFor="additional-notes" className="form-label fw-semibold">Notes for the renter:</label>
                <input id="additional-notes" className="form-control"
                  placeholder="Roommates, conditions, etc."
                  value={notes} onChange={(e)=>setNotes(e.target.value)} />
              </div>

              {/* Photos kept in UI; upload handling to come later */}

              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Listing"}
              </button>

              {msg && <div className="text-success mt-3">{msg}</div>}
              {err && <div className="text-danger mt-3">Error: {err}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
