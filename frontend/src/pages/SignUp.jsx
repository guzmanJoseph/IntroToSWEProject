import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";
import { useState } from "react";
import { api } from "../api";

export default function SignUp() {
  // Keep the extra fields visually (for later), but we only send email to backend
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [busy, setBusy]           = useState(false);
  const [msg, setMsg]             = useState("");
  const [err, setErr]             = useState("");

  async function onSubmit(e) {
  e.preventDefault();
  setMsg(""); setErr(""); setBusy(true);
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000"}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    setMsg(`Registered: ${data?.user?.email || email}`);
    setFirstName(""); setLastName(""); setEmail("");
  } catch (e2) {
    setErr(e2.message);
  } finally {
    setBusy(false);
  }
}

  return (
    <div className="signUp-page">
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <form className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm" onSubmit={onSubmit}>
          <h1 className="text-2x1 font-bold mb-6 text-center">Sign Up</h1>

          <label className="form-label fw-semibold">First Name</label>
          <input
            value={firstName}
            onChange={(e)=>setFirstName(e.target.value)}
            placeholder="John"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="form-label fw-semibold">Last Name</label>
          <input
            value={lastName}
            onChange={(e)=>setLastName(e.target.value)}
            placeholder="Doe"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="form-label fw-semibold">UF Email</label>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="yourname@ufl.edu"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Password fields kept in UI but not sent (backend is email-only for now) */}
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="form-label fw-semibold">Re-enter Password</label>
          <input
            type="password"
            placeholder="Repeat your password"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button type="submit" className="w-full h-10 bg-blue-500 text-white hover:bg-blue-600 transition" disabled={busy}>
            {busy ? "Creating..." : "Sign Up"}
          </button>

          {msg && <div className="text-success mt-3">{msg}</div>}
          {err && <div className="text-danger mt-3">Error: {err}</div>}
          <div className="text-muted mt-2" style={{fontSize: 12}}>
            * Only @ufl.edu emails are accepted (enforced on the server).
          </div>
        </form>
      </div>
    </div>
  );
}