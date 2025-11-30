<<<<<<< HEAD
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import GKLogo from "./assets/GatorKeys-Logo.png";
import UserRegistration from "./components/UserRegistration";
import "./App.css";

function App() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <>
      {!showRegistration ? (
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
              <button
                onClick={() => setShowRegistration(true)}
                className="drop-shadow-[2px_2px_0_black] drop-shadow-[-2px_-2px_0_black] text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </button>

              <div className="space-y-0.75 p-3 bg-blue-500 rounded-full cursor-pointer hover:bg-black/70 transition">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
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
      ) : (
        <div>
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <button
              onClick={() => setShowRegistration(false)}
              className="text-white hover:text-gray-200 font-medium"
            >
              ← Back to Home
            </button>
            <h1 className="text-xl font-bold">GatorKeys Registration</h1>
            <div></div>
          </div>
          <UserRegistration />
        </div>
      )}
=======
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
} from "react-router-dom";
import Home from "./pages/FrontPage";
import About from "./pages/About";
import AddListing from "./pages/AddListing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="pt-20 bg-gray-300">
        <Outlet />
      </div>
>>>>>>> origin/Joseph-Test
    </>
  );
}

<<<<<<< HEAD
export default App;
=======
function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Routes */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> origin/Joseph-Test
