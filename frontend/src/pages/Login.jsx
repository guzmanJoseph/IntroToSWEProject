import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { useState } from "react";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [busy, setBusy]   = useState(false);
  const [msg, setMsg]     = useState("");
  const [err, setErr]     = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setBusy(true);
    try {
      const res = await api.login(email.trim());
      setMsg(`Login OK: ${res?.user?.email || email}`);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="card shadow-lg p-4 border-0" style={{minWidth: 380}}>
        <h2 className="text-center mb-4 text-primary fw-bold">Log In</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">UF Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="yourname@ufl.edu"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>

          {/* kept for UI parity; backend ignores passwords for now */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={busy}>
            {busy ? "Checking..." : "Log In"}
          </button>

          {msg && <div className="text-success mt-3">{msg}</div>}
          {err && <div className="text-danger mt-3">Error: {err}</div>}

          <p className="text-center mt-3 mb-0">
            Don't have an account?{" "}
            <a href="/signup" className="text-decoration-none text-primary">
              Sign up Here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}