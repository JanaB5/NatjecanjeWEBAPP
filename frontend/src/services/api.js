import axios from "axios";


export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});




const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const getEvents = () => API.get("/events");
export const getMentorships = () => API.get("/mentorships"); // ✅ add this line back
export const sendChatMessage = (message) => API.post("/chat", { message });

export const registerEvent = (username, event_id) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("event_id", event_id);
  return API.post("/register_event", formData);
};

export const unregisterEvent = (username, event_id) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("event_id", event_id);
  return API.post("/unregister_event", formData);
};
