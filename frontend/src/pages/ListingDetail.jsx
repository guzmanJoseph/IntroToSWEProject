import { useLocation, useParams, Link } from "react-router-dom";

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const listing = location.state?.listing;

  // If the user navigated directly without going through home page, we can't fetch a single doc id here reliably
  // without a backend id. In that case im showing a message letting the use know and a back link to home.
  if (!listing) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <p className="mb-4">
          This listing was opened directly or the data is not available in route
          state.
        </p>
        <p className="mb-4">
          Try browsing from the home page so the app can pass the listing data
          to this page.
        </p>
        <Link to="/" className="text-blue-600 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="md:flex md:gap-6">
        <div className="md:flex-1">
          {/* Images: if listing.images exists (array) render a gallery, otherwise single image */}
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
          <h1 className="text-3xl font-bold mb-2">
            {listing.title || listing.address || "Untitled"}
          </h1>
          {listing.price !== undefined && (
            <p className="text-2xl text-blue-600 font-semibold mb-2">
              {typeof listing.price === "number"
                ? `$${listing.price}`
                : listing.price}
            </p>
          )}

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

          {/* Contact info if present */}
          {/* We should probably update popular listings either replacing it with actual listings or just adding info to it */}
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
    </div>
  );
}
