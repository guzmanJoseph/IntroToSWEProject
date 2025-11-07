import PopularListings from "../components/PopularListings";
import NewListings from "../components/NewListings";

export default function FrontPage() {
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
          <input
            type="text"
            placeholder="Search..."
            className="ml-4 p-2 border border-orange-400 rounded-lg w-200 bg-white text-black"
          />
        </div>
      </div>

      {/* Static Popular grid */}
      <div className="mt-10">
        <PopularListings />
      </div>

      {/* Live “New Listings” grid */}
      <NewListings />
    </div>
  );
}
