import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [dob, setDob] = useState({ month: "", day: "", year: "" });
  const [gender, setGender] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    
    // Validation
    if (!password || password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    
    if (password !== rePassword) {
      setErr("Passwords do not match");
      return;
    }
    
    setBusy(true);
    try {
      const data = await api.register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        dob,
        gender
      );
      
      const userEmail = data?.user?.email || email.trim();
      // Auto-login after successful registration
      login(userEmail);
      setMsg(`Registered and logged in: ${userEmail}`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRePassword("");
      setDob({ month: "", day: "", year: "" });
      setGender("");
      // Redirect to home after successful signup
      setTimeout(() => navigate("/"), 1000);
    } catch (e2) {
      // Better error handling
      if (e2.message.includes("Failed to fetch") || e2.message.includes("NetworkError")) {
        setErr("Cannot connect to server. Make sure the backend is running on http://127.0.0.1:5000");
      } else {
        setErr(e2.message);
      }
      console.error("Signup error:", e2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signUp-page">
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <form
          className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
          onSubmit={onSubmit}
        >
          <h1 className="text-2x1 font-bold mb-6 text-center">Sign Up</h1>
          <label htmlFor="FirstName" className="form-label fw-semibold">
            First Name
          </label>

          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label htmlFor="LastName" className="form-label fw-semibold">
            Last Name
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label htmlFor="DOB" className="form-label fw-semibold">
            Date of Birth
          </label>
          <div className="mb-4 flex space-x-2">
            <select
              name="month"
              value={dob.month}
              onChange={(e) => setDob({ ...dob, month: e.target.value })}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, i) => (
                <option key={i} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              name="day"
              value={dob.day}
              onChange={(e) => setDob({ ...dob, day: e.target.value })}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              name="year"
              value={dob.year}
              onChange={(e) => setDob({ ...dob, year: e.target.value })}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <label htmlFor="Gender" className="form-label fw-semibold">
            Gender
          </label>
          <select
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-Binary</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>

          <label htmlFor="Email" className="form-label fw-semibold">
            UF Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@ufl.edu"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <label htmlFor="Password" className="form-label fw-semibold">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password (min 6 characters)"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            minLength={6}
          />
          <label htmlFor="RePassword" className="form-label fw-semibold">
            Re-enter Password
          </label>
          <input
            type="password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            placeholder="Repeat your password"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full h-10 bg-blue-500 text-white hover:bg-blue-600 transition"
            disabled={busy}
          >
            {busy ? "Creating..." : "Sign Up"}
          </button>

          {msg && <div className="text-success mt-3">{msg}</div>}
          {err && <div className="text-danger mt-3">Error: {err}</div>}
          <div className="text-muted mt-2" style={{ fontSize: 12 }}>
            * Only @ufl.edu emails are accepted (enforced on the server).
          </div>
        </form>
      </div>
    </div>
  );
}
