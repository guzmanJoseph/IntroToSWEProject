import PopularListings from "../components/PopularListings";
import NewListings from "../components/NewListings";
import { useState } from "react";

export default function FrontPage() {
  const [isOpen, setIsOpen] = useState(false);

  // Filter states
  const [title, setTitle] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parking, setParking] = useState("");

  // Store filtered results
  const [filteredListings, setFilteredListings] = useState(null);

  const applyFilters = async () => {
    const filters = {
      title,
      maxPrice,
      furnished,
      parking,
      startDate,
      endDate,
    };

    try {
      const res = await fetch("http://localhost:5000/listings/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      console.log("filtered listings:", data);
      setFilteredListings(data);
    } catch (err) {
      console.error("Filter request failed:", err);
    }

    setIsOpen(false);
  };

  return (
    <div>
      {/* Hero section */}
      <div
        className="min-h-screen bg-cover bg-center object-cover"
        style={{
          backgroundImage:
            "url('https://sweetwatergainesville.com/wp-content/uploads/2023/10/Sweetwater_Exterior-1.jpg')",
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center pt-100">
          <p className="font-bold text-5xl mb-6 drop-shadow-[2px_2px_0_black] text-orange-400">
            Find your perfect sublease
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 border border-orange-400 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition"
          >
            Filter Subleases
          </button>
        </div>
      </div>

      {/* Listings — if filtered results exist, show them instead */}
      <div className="mt-10">
        <PopularListings listings={filteredListings} />
      </div>

      <NewListings listings={filteredListings} />

      {/* POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl relative">

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              X
            </button>

            <h2 className="text-2xl font-bold mb-4 text-orange-500">
              Filter Subleases
            </h2>

            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="block font-semibold">Name</label>
                <input
                  type="text"
                  placeholder="Input name of unit..."
                  className="w-full border p-2 rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block font-semibold">Max Price ($)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="900"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Furnished */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="furnished"
                  checked={furnished}
                  onChange={(e) => setFurnished(e.target.checked)}
                />
                <label htmlFor="furnished" className="font-semibold">
                  Furnished
                </label>
              </div>

              {/* Move-in */}
              <div>
                <label className="block font-semibold mb-1">Move-in Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Move-out */}
              <div>
                <label className="block font-semibold mb-1">Move-out Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Parking */}
              <div>
                <label className="block font-semibold mb-1">Parking Availability</label>

                <div className="flex flex-col gap-1 mt-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="parking"
                      value="any"
                      checked={parking === "any"}
                      onChange={() => setParking("any")}
                    />
                    <span>Any</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="parking"
                      value="yes"
                      checked={parking === "yes"}
                      onChange={() => setParking("yes")}
                    />
                    <span>Parking Available</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="parking"
                      value="no"
                      checked={parking === "no"}
                      onChange={() => setParking("no")}
                    />
                    <span>No Parking</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Apply Filters */}
            <button
              className="bg-orange-500 text-white w-full mt-8 py-2 rounded-xl font-semibold hover:bg-orange-600"
              onClick={applyFilters}
            >
              Apply Filters
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
