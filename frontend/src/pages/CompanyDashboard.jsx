import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { Link } from "react-router-dom";

export default function CompanyDashboard() {
  const [company, setCompany] = useState({});
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, events: 0, applications: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const jobsRef = useRef(null);
  const eventsRef = useRef(null);
  const applicationsRef = useRef(null);

  const [form, setForm] = useState({ id: null, title: "", description: "", location: "", pay: "" });
  const [profileForm, setProfileForm] = useState({
    about: "",
    website: "",
    contact_email: "",
    industry: "",
  });

  // === Applications handling ===
  const [applicants, setApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // === Fetch osnovni podaci ===
  useEffect(() => {
    const companyToken =
      localStorage.getItem("company_token") || localStorage.getItem("token"); // ✅ fallback
    if (!companyToken) {
      console.warn("⚠️ No token found — redirecting to login");
      // window.location.href = "/login-company"; // ❌ comment this out for now
    }
    api.defaults.headers.common.Authorization = `Bearer ${companyToken}`;

    const user = JSON.parse(localStorage.getItem("company"));
    setCompany(user || {});
    fetchJobs();
    fetchEvents();
    fetchStats();
  }, []);

  // === API pozivi ===
  const fetchJobs = async () => {
    try {
      const res = await api.get("/company/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Greška pri dohvaćanju poslova:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get("/company/events");
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Greška pri dohvaćanju događaja:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/company/stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Greška pri dohvaćanju statistike:", err);
    }
  };

  const fetchApplicants = async (job) => {
    try {
      // get all apps for THIS company
      const res = await api.get("/company/applications");
      // filter to this specific job (by title)
      const list = (res.data.applications || []).filter(
        (a) => a.job_name === job.title
      );

      setApplicants(list);
      setSelectedJob(job);
      setShowApplicants(true);
    } catch (err) {
      console.error("Greška pri dohvaćanju prijava:", err);
      alert("❌ Greška pri dohvaćanju prijava.");
    }
  };

  // === Scroll helper ===
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // === Dodaj ili uredi posao ===
  const handleAddOrEditJob = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (editMode) formData.append("job_id", form.id);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("pay", form.pay); // 💰

    if (editMode) await api.post("/company/edit_job", formData);
    else await api.post("/company/add_job", formData);

    setShowForm(false);
    setForm({ id: null, title: "", description: "", location: "", pay: "" });
    fetchJobs();
    fetchStats();
  };

  // === Dodaj događaj ===
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await api.post("/company/add_event", formData);
    e.target.reset();
    fetchEvents();
    fetchStats();
  };

  // === Ažuriraj profil ===
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("about", profileForm.about);
      formData.append("website", profileForm.website);
      formData.append("contact_email", profileForm.contact_email);
      formData.append("industry", profileForm.industry);
      if (logoFile) formData.append("file", logoFile);

      const res = await api.post("/company/update_profile", formData);
      if (res.data.success) {
        setCompany(res.data.company);
        localStorage.setItem("company", JSON.stringify(res.data.company));
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("Greška pri ažuriranju profila:", err);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto space-y-8">
        {/* === HERO SECTION === */}
        <div className="bg-white/90 rounded-xl shadow-lg p-8 flex flex-col md:flex-row justify-between items-center border border-gray-200">
          <div className="flex items-center gap-6">
            <img
              src={
                company.logo
                  ? `http://127.0.0.1:8000/profile_file/${company.logo}`
                  : "/default-company.png"
              }
              alt="logo"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 shadow"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                {company.company_name || "Vaša tvrtka"}
              </h1>
              <p className="text-blue-700 font-medium">{company.industry || "Industrija"}</p>
              <p className="mt-2 text-gray-600 max-w-md">{company.about || "Dodajte opis firme..."}</p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            ✏️ Uredi profil
          </button>
        </div>

        {/* === STATISTIKA === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              label: "Objavljeni oglasi",
              value: stats.jobs,
              color: "text-blue-600",
              action: () => scrollToSection(jobsRef),
            },
            {
              label: "Prijavljeni studenti",
              value: stats.applications,
              color: "text-purple-600",
              action: () => scrollToSection(applicationsRef),
            },
            {
              label: "Planirani događaji",
              value: stats.events,
              color: "text-green-600",
              action: () => scrollToSection(eventsRef),
            },
          ].map((card, i) => (
            <div
              key={i}
              onClick={card.action}
              className="bg-white/90 cursor-pointer hover:scale-[1.02] transition-transform shadow-md p-6 rounded-xl text-center border border-gray-100 hover:shadow-lg"
            >
              <h3 className="text-gray-500 text-sm uppercase tracking-wide">{card.label}</h3>
              <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* === OGLASI === */}
        <section ref={jobsRef} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📄 Vaši oglasi</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setShowForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + Novi oglas
              </button>
              <Link
                to="/search-students"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                🔍 Pretraži studente
              </Link>
            </div>
          </div>

          {jobs.length > 0 ? (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="border p-4 rounded-md bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.location}</p>
                    <p className="text-gray-600 mt-1 text-sm">{job.description}</p>
                    <p className="text-green-600 font-semibold mt-1">{job.pay || "N/A"}</p>
                  </div>

                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => fetchApplicants(job)}
                      className="text-purple-600 font-medium hover:underline"
                    >
                      👀 Prijave
                    </button>

                    <button
                      onClick={() => {
                        setEditMode(true);
                        setForm(job);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Uredi
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nema objavljenih oglasa.</p>
          )}
        </section>

        {/* === DOGAĐAJI === */}
        <section ref={eventsRef} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📅 Kalendar događaja</h2>
          <form onSubmit={handleAddEvent} className="mb-4 flex flex-col md:flex-row gap-3">
            <input
              name="title"
              placeholder="Naziv događaja"
              className="border px-3 py-2 rounded w-full md:w-1/3"
              required
            />
            <input
              name="date"
              type="date"
              className="border px-3 py-2 rounded w-full md:w-1/3"
              required
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              Dodaj
            </button>
          </form>

          {events.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {events.map((e) => (
                <li key={e.id} className="py-2 flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{e.title}</p>
                    <p className="text-sm text-gray-500">
                      📅 {new Date(e.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nema dodanih događaja.</p>
          )}
        </section>

        {/* === MODAL PROFILA === */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[420px]">
              <h3 className="text-xl font-bold mb-4">Uredi profil firme</h3>
              <form onSubmit={handleUpdateProfile}>
                <textarea
                  placeholder="Opis firme"
                  value={profileForm.about}
                  onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Industrija"
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Web stranica"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <input
                  type="email"
                  placeholder="Kontakt e-mail"
                  value={profileForm.contact_email}
                  onChange={(e) => setProfileForm({ ...profileForm, contact_email: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <div className="mb-3">
                  <label className="text-sm text-gray-600 block mb-1">Logo firme:</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="preview"
                      className="w-24 h-24 rounded-full object-cover mt-3 border"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Spremi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL OGLASA === */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
              <h3 className="text-xl font-bold mb-4">
                {editMode ? "Uredi oglas" : "Novi oglas"}
              </h3>
              <form onSubmit={handleAddOrEditJob}>
                <input
                  type="text"
                  placeholder="Naslov"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                  required
                />
                <textarea
                  placeholder="Opis posla"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-3"
                  rows="3"
                  required
                />
                <input
                  type="text"
                  placeholder="Plaća (npr. 15€/h)"
                  value={form.pay}
                  onChange={(e) => setForm({ ...form, pay: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-4"
                />
                <input
                  type="text"
                  placeholder="Lokacija"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border rounded px-3 py-2 mb-4"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {editMode ? "Spremi" : "Dodaj"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* === APPLICANTS MODAL === */}
        {showApplicants && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                Prijavljeni studenti — {selectedJob?.title}
              </h3>

              {applicants.length ? (
                <ul className="space-y-3">
                  {applicants.map((app) => (
                    <li
                      key={app.id}
                      className="p-3 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{app.username}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="font-semibold">{app.status}</span>
                        </p>
                      </div>

                      <select
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const form = new FormData();
                          form.append("username", app.username);
                          form.append("job_name", app.job_name); // title
                          form.append("new_status", newStatus);
                          try {
                            await api.post("/update_application_status", form);
                            // refresh list after change
                            fetchApplicants(selectedJob);
                          } catch (err) {
                            console.error(err);
                            alert("❌ Greška pri ažuriranju statusa.");
                          }
                        }}
                        defaultValue={app.status}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="Poslano">Poslano</option>
                        <option value="Round 1">Round 1</option>
                        <option value="Round 2">Round 2</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nema prijava za ovaj oglas.</p>
              )}

              <div className="text-right mt-4">
                <button
                  onClick={() => setShowApplicants(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
