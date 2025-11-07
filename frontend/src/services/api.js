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

// ✅ === DODANO: Company endpoints ===

// Registracija firme
export const registerCompany = (formData) => api.post("/register_company", formData);

// Prijava firme
export const loginCompany = (formData) => api.post("/login_company", formData);

// Dodavanje novog posla (oglas)
export const addJob = (formData) => api.post("/company/add_job", formData);

// Dohvati sve poslove firme
export const getCompanyJobs = () => api.get("/company/jobs");

// Ažuriranje oglasa
export const editJob = (formData) => api.post("/company/edit_job", formData);

// Dohvati prijave studenata za poslove firme (ako koristiš)
export const getCompanyApplications = (username) =>
  api.get(`/applications/${username}`);

// Ažuriraj status prijave (npr. “Odobreno”, “Odbijeno”)
export const updateApplicationStatus = (username, job_id, new_status) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("job_id", job_id);
  formData.append("new_status", new_status);
  return api.post("/update_application_status", formData);
};

// ✅ === NOVO: Students search & profiles (za firme) ===

// Dohvati listu svih studenata (ili pretragu po query stringu)
export const getStudents = (query = "") =>
  api.get(`/students${query ? `?query=${query}` : ""}`);

// Dohvati javni profil jednog studenta
export const getStudentPublic = (username) => api.get(`/student_public/${username}`);
