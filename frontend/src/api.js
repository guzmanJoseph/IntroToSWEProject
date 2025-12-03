const API_BASE = import.meta.env.VITE_API_BASE;

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
  
  // Authentication
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email, password, firstName, lastName, dob, gender) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        dob,
        gender,
      }),
    }),
  
  // Messaging endpoints
  sendMessage: (senderEmail, receiverEmail, text) =>
    request("/messages", {
      method: "POST",
      body: JSON.stringify({
        sender_email: senderEmail,
        receiver_email: receiverEmail,
        text: text,
      }),
    }),
  
  getConversation: (senderEmail, receiverEmail) =>
    request(`/messages?sender=${encodeURIComponent(senderEmail)}&receiver=${encodeURIComponent(receiverEmail)}`),
  
  getConversations: (userEmail) =>
    request(`/messages/conversations?user_email=${encodeURIComponent(userEmail)}`),
  
  markMessagesRead: (userEmail, otherUserEmail) =>
    request("/messages/read", {
      method: "PUT",
      body: JSON.stringify({
        user_email: userEmail,
        other_user_email: otherUserEmail,
      }),
    }),
  
  getUser: (email) => request(`/users/${encodeURIComponent(email)}`),
  
  updateUser: (email, data) =>
    request(`/users/${encodeURIComponent(email)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  getUserListings: (email) =>
    request(`/listings/user/${encodeURIComponent(email)}`),
  
  filterListings: (filters) =>
    request("/listings/filter", {
      method: "POST",
      body: JSON.stringify(filters),
    }),
  
  getListing: (id) => request(`/listings/${encodeURIComponent(id)}`),
  
  updateListing: (id, data) =>
    request(`/listings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  deleteListing: (id) =>
    request(`/listings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
