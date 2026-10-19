import axios from "axios";

const api = axios.create({
  // In local dev, "/api" is forwarded to localhost:5000 by Vite's proxy
  // (see vite.config.js). In production there's no such proxy -- the
  // frontend and backend are deployed on two separate domains -- so this
  // reads VITE_API_URL (set in a .env file at deploy time, or in your
  // hosting provider's dashboard) and points there instead.
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vaultkeep_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server ever tells us our token is invalid/expired, clean up
// locally so the UI drops back to the login screen instead of looping.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vaultkeep_token");
      localStorage.removeItem("vaultkeep_user");
    }
    return Promise.reject(err);
  }
);

export default api;
