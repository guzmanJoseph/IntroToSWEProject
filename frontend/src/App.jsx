import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/FrontPage";
import About from "./pages/About";
import AddListing from "./pages/AddListing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import GKLogo from "./assets/GatorKeys-Logo.png";
import "./App.css";

function App() {
  function openNav() {
    document.getElementById("Sidepanel").style.width = "250px";
  }

  function closeNav() {
    document.getElementById("Sidepanel").style.width = "0";
  }

  return (
    <Router>
      {/* Header/Navbar */}

      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6 bg-transparent z-50">
        <div className="flex items-center space-x-0">
          <img src={GKLogo} alt="Logo" className="h-15 w-15 mt-2 ml-2" />
          <Link to="/" className="text-6x1 font-bold">
            <h1 className="text-6xl font-bold">
              <span className="text-blue-500">Gator</span>
              <span className="text-orange-400">Keys</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/add-listing"
            className="text-2xl font-bold hover:text-orange-400"
          >
            Add Listing
          </Link>

          <div id="Sidepanel" className="sidepanel">
            <button onClick={closeNav} className="closebtn">
              &times;
            </button>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/add-listing">Add Listing</Link>
            <Link to="/login">Log in or sign up</Link>
          </div>

          <button className="openbtn" onClick={openNav}>
            &#9776;
          </button>
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
