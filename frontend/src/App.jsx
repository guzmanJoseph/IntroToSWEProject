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
import Navbar from "./components/Navbar";
import "./App.css";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="pt-20 bg-gray-300">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      {/* Routes */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
