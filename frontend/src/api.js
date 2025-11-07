const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  getListings: () => request("/listings"),
  createListing: (payload) =>
    request("/listings", { method: "POST", body: JSON.stringify(payload) }),
};
