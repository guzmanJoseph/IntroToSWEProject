import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useState } from "react";
import "./AddListing.css"

export default function AddListing() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  return (
    <div className="add-listing-page">

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary">
            Add a New Listing
          </h1>
          <p className="text-muted">
            Fill out the details below to post your sublease.
          </p>
        </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form className="card shadow-lg p-4 border-0">
            <div className="mb-3">
              <label htmlFor="title" className="form-label fw-semibold">
                Listing Title
              </label>
              <input type="text" className="form-control" id="title" placeholder="e.g 4x4 apartment near UF"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="userName" className="form-label fw-semibold">
                Your Name
              </label>
              <input type="text" className="form-control" id="userName" placeholder="Enter name here"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="userEmail" className="form-label fw-semibold">
                Your Email
              </label>
              <input type="email" className="form-control" id="userEmail" placeholder="yourname@ufl.edu"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label fw-semibold">
                Address of Unit
              </label>
              <input type="text" className="form-control" id="address" placeholder="e.g 123 University Ave, Gainesville, FL, Apt. 603"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="rent" className="form-label fw-semibold">
                Monthly Rent ($)
              </label>
              <input type="number" className="form-control" id="rent" placeholder="e.g 1200"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="availableFrom" className="form-label fw-semibold">
                Select the dates you would like to sublease the apartment below.
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                isClearable={true}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select date range"
                className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="parking" className="form-label fw-semibold">
                  Parking Availability
                </label>
                <select id="parking" className="form-select">
                  <option value="">Select an option</option>
                  <option value="included">Included</option>
                  <option value="addtional-fee"> Available for Addtional Fee</option>
                  <option value="none"> No Parking </option>
                </select>
              </div>

              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="furnished"></input>
                <label htmlFor="furnished" className="form-check-label fw-semibold">
                  Furnished
                </label>
              </div>

              <div className="mb-3">
              <label htmlFor="additional-notes" className="form-label fw-semibold">
                Notes for the renter:
              </label>
              <input type="text" className="form-control" id="additional-notes" placeholder="Input anything you wanter the renter to know here (Roomates, Conditions, etc.)"></input>
            </div>

            <div className="mb-3">
              <label htmlFor="photos" className="form-label fw-semibold">
                Upload Photos
              </label>
              <input type="file" className="form-control" id="photos" multiple></input>
              <small className="text-muted">
                You can upload multiple images
              </small>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Submit Listing
            </button>
            
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
