import { Link } from "react-router-dom";
import GKLogo from "../assets/GatorKeys-Logo.png";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [sideOpen, setSideOpen] = useState(false);

  const openNav = () => setSideOpen(true);
  const closeNav = () => setSideOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-200/0 backdrop-blur-md shadow-md z-50 h-20 flex items-center justify-between px-8">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <img src={GKLogo} alt="Logo" className="h-12 w-12" />
        <Link to="/" className="text-3xl font-bold flex items-center">
          <span className="text-blue-500">Gator</span>
          <span className="text-orange-400">Keys</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <Link
          to="/add-listing"
          className="text-lg font-semibold hover:text-orange-400"
        >
          Add Listing
        </Link>

        {/* Side panel (hamburger menu) */}
        <div
          id="Sidepanel"
          className="sidepanel"
          style={{ width: sideOpen ? "250px" : "0" }}
        >
          <button onClick={closeNav} className="closebtn">
            &times;
          </button>
          <Link to="/" onClick={closeNav}>
            Home
          </Link>
          <Link to="/about" onClick={closeNav}>
            About
          </Link>
          <Link to="/add-listing" onClick={closeNav}>
            Add Listing
          </Link>
          <Link to="/login" onClick={closeNav}>
            Log in or sign up
          </Link>
        </div>

        {/* Hamburger Button */}
        <button className="openbtn" onClick={openNav}>
          &#9776;
        </button>
      </div>
    </nav>
  );
}
