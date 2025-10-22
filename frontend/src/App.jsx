import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import GKLogo from "./assets/GatorKeys-Logo.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  function openNav() {
    document.getElementById("Sidepanel").style.width = "250px";
  }

  function closeNav() {
    document.getElementById("Sidepanel").style.width = "0";
  }

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center object-cover opacity-100"
        style={{
          backgroundImage:
            "url('https://sweetwatergainesville.com/wp-content/uploads/2023/10/Sweetwater_Exterior-1.jpg')",
        }}
      >
        <div className="flex justify-between items-center px-8">
          {/* Text on header of page goes here */}
          <div className="flex items-center space-x-0">
            <img
              src={GKLogo}
              alt="GatorKeys Logo"
              className="h-15 w-15 mt-5 ml-2"
            />
            <h1 className="drop-shadow-[2px_2px_0_black] drop-shadow-[-2px_-2px_0_black] text-6xl font-bold pt-20">
              <span className="text-blue-500">Gator</span>
              <span className="text-orange-400">Keys</span>
            </h1>
          </div>

          {/* Add listing button and hamburger menu goes here */}
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">Add Listing</h2>

            {/* ✅ Put the side panel here */}
            <div id="Sidepanel" className="sidepanel">
              <button onClick={closeNav} className="closebtn">
                &times;
              </button>
              <a href="#">Home</a>
              <a href="#">About</a>
              <a href="#">Services</a>
              <a href="#">Contact</a>
            </div>

            {/* ✅ Hamburger button */}
            <button className="openbtn" onClick={openNav}>
              &#9776;
            </button>
          </div>
        </div>

        {/* Search bar and Text above it goes here */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-75">
          <p className="font-bold text-5xl mb-6 drop-shadow-[2px_2px_0_black] drop-shadow-[-2px_-2px_0_black]">
            {" "}
            Find your perfect sublease
          </p>
          <input
            type="text"
            placeholder="Search..."
            className="ml-4 p-2 border border-orange-400 rounded-lg w-200 bg-white text-black"
          />
        </div>
      </div>
    </>
  );
}

export default App;
