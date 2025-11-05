import axios from "axios";

// === Base configuration ===
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// === Automatically attach token ===
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// === Core endpoints ===
export const getEvents = () => api.get("/events");
export const getMentorships = () => api.get("/mentorships");
export const sendChatMessage = (message) => api.post("/chat", { message });

// === Event registration (secured) ===
export const registerEvent = (username, event_id) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("username", username);
  formData.append("event_id", event_id);

  return api.post("/register_event", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// === Event unregistration (secured) ===
export const unregisterEvent = (username, event_id) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("username", username);
  formData.append("event_id", event_id);

  return api.post("/unregister_event", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
