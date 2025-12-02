import React from "react";
import { Link } from "react-router-dom";

const fallbackImg =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop";

function dollars(v) {
  if (v === undefined || v === null || isNaN(v)) return "";
  return `$${Number(v).toLocaleString()}/month`;
}

const PopularListings = ({ listings: propListings }) => {
  // Use prop listings if provided, otherwise use default hardcoded ones
  const defaultListings = [
    {
      id: 1,
      title: "Luxury 2BR Apartment Near UF",
      location: "Gainesville, FL",
      price: "$950/month",
      image:
        "https://sxxweb8cdn.cachefly.net/img/thumbnail.aspx?p=/common/uploads/zrs2019/626/media/c70b0dca-be1f-499e-b6e3-55cf3e4873fc.jpg&q=71&w=0&h=0&f=webp",
    },
    {
      id: 2,
      title: "Cozy Downtown Studio",
      location: "Gainesville, FL",
      price: "$700/month",
      image:
        "https://images.trvl-media.com/lodging/53000000/52780000/52779500/52779402/f64889d2.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    },
    {
      id: 3,
      title: "4BR House with Pool",
      location: "Gainesville, FL",
      price: "$1,200/month",
      image:
        "https://img.offcampusimages.com/1NfXkCp2FXDo9FrPdSzaRtZaOG0=/660x440/left/top/smart/images/ndegfh0rakbcgqzain3ij5ueddl2exdkkmo6pfv018e.jpeg?p=1",
    },
    {
      id: 4,
      title: "Condo in Archer",
      location: "Gainesville, FL",
      price: "$800/month",
      image:
        "https://images1.apartments.com/i2/x1vhyHmvN7FK5cX-rFK-CqTlbOe2E-6MGur_qAC22-8/117/2275-nw-16th-terrace-gainesville-fl-building-photo.jpg?p=1",
    },
    {
      id: 5,
      title: "Affordable Room Near Campus",
      location: "Gainesville, FL",
      price: "$800/month",
      image:
        "https://i.apartmentguide.com/t_3x2_fixed_webp_2xl/e615e96e91ea002c1accc205bb0651c1",
    },
    {
      id: 6,
      title: "Luxury 3BR Unit",
      location: "Gainesville, FL",
      price: "$1400/month",
      image:
        "https://www.ilovetheupperwestside.com/material/media/2023/11/1_Front_York_Hero-Image-1-min.jpg",
    },
  ];

  const listings = propListings || defaultListings;

  // If filtered listings are provided, show them
  if (propListings) {
    if (propListings.length === 0) {
      return (
        <div className="max-w-7x1 mx-auto mt-12 px-6">
          <h2 className="text-3x1 font-bold mb-6 text-gray-800">
            Filtered Results
          </h2>
          <p className="text-gray-600">No listings match your filters.</p>
        </div>
      );
    }

    return (
      <div className="max-w-7x1 mx-auto mt-12 px-6">
        <h2 className="text-3x1 font-bold mb-6 text-gray-800">
          Filtered Results ({listings.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing, i) => {
            const slugBase = (listing.title || listing.address || "listing").toString();
            const slug = encodeURIComponent(
              slugBase.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + `-${listing.id || i}`
            );
            
            return (
              <Link
                key={listing.id || i}
                to={`/listing/${slug}`}
                state={{ listing }}
                className="block bg-white rounded-2x1 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={listing.imageUrl || listing.image || fallbackImg}
                  alt={listing.title || "Listing"}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {listing.title || "Untitled"}
                  </h3>
                  <p className="text-gray-600">{listing.address || listing.location || "Gainesville, FL"}</p>
                  {listing.price !== undefined && (
                    <p className="text-blue-500 font-bold mt-2">
                      {dollars(listing.price)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Default view with hardcoded listings
  return (
    <div className="max-w-7x1 mx-auto mt-12 px-6">
      <h2 className="text-3x1 font-bold mb-6 text-gray-800">
        Popular Subleases
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listing/${listing.id}`}
            state={{ listing }}
            className="block bg-white rounded-2x1 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {listing.title}
              </h3>
              <p className="text-gray-600">{listing.location}</p>
              <p className="text-blue-500 font-bold mt-2">{listing.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularListings;
