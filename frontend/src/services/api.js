import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const getEvents = () => API.get("/events");
export const getMentorships = () => API.get("/mentorships");
export const sendChatMessage = (message) => API.post("/chat", { message });
