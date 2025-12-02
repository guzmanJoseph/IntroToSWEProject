import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const fallbackImg =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop";

function dollars(v) {
  if (v === undefined || v === null || isNaN(v)) return "";
  return `$${Number(v).toLocaleString()}/month`;
}

export default function NewListings({ listings: propListings }) {
  console.log("[NewListings] module loaded");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    // If filtered listings are provided, use them instead of fetching
    if (propListings) {
      setListings(propListings);
      setLoading(false);
      return;
    }

    console.log("[NewListings] render");
    (async () => {
      try {
        const data = await api.getListings();
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          const ta = new Date(a.createdAt || 0).getTime();
          const tb = new Date(b.createdAt || 0).getTime();
          return tb - ta; // newest first
        });
        setListings(sorted);
      } catch (e) {
        setErr(e.message || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    })();
  }, [propListings]);

  return (
    <div className="max-w-7x1 mx-auto mt-12 px-6">
      <h2 className="text-3x1 font-bold mb-6 text-gray-800">New Listings</h2>

      {loading && <div>Loading listings…</div>}
      {err && <div className="text-red-600">Error: {err}</div>}

      {!loading && !err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.length === 0 && <div>No listings yet.</div>}
          {listings.map((l, i) => {
            // Create a stable slug id for routes: prefer explicit id, otherwise use title + index
            const slugBase = (l.title || l.address || "listing").toString();
            const slug = encodeURIComponent(
              slugBase.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + `-${i}`
            );

            return (
              <Link
                key={i}
                to={`/listing/${slug}`}
                state={{ listing: l }}
                className="block bg-white rounded-2x1 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={l.imageUrl || fallbackImg}
                  alt={l.title || "Listing"}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {l.title || "Untitled"}
                  </h3>
                  <p className="text-gray-600">
                    {l.address || "Gainesville, FL"}
                  </p>
                  {l.price !== undefined && (
                    <p className="text-blue-500 font-bold mt-2">
                      {dollars(l.price)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
