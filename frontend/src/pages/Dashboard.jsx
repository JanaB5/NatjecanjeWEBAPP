import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Mail } from "lucide-react";
import { api, getEvents } from "../services/api";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [useSavedCV, setUseSavedCV] = useState(true);
  const [coverLetter, setCoverLetter] = useState(null);
  const location = useLocation();
  // === Notifications ===
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  // ✅ Helper for per-user localStorage key
  const getSavedJobsKey = (u) => (u ? `savedJobs_${u}` : "savedJobs_guest");

  // === Load joined events for this student (and refresh on change) ===
  useEffect(() => {
    // ✅ Always read student from localStorage first
    const stored = JSON.parse(localStorage.getItem("student"));

    if (!stored) {
      // No user saved -> go to login
      window.location.href = "/login";
      return;
    }

    // Temporarily show dashboard immediately
    setStudent(stored);

    // ✅ Load profile image if saved in backend
    if (stored.profile_image) {
      setProfileImage(`http://127.0.0.1:8000/profile_file/${stored.profile_image}`);
    }

    // ✅ Now verify with backend (optional but secure)
    api
      .get(`/student/${stored.username}`)
      .then((res) => {
        const updated = { ...res.data, username: stored.username };
        localStorage.setItem("student", JSON.stringify(updated));
        setStudent(updated);

        // ✅ If backend has an image, show it immediately
        if (updated.profile_image) {
          setProfileImage(`http://127.0.0.1:8000/profile_file/${updated.profile_image}`);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        // If token invalid or user missing -> logout cleanly
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("student");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  }, []); // ✅ Only once on mount

  useEffect(() => {
    if (!student) return;

    getEvents()
      .then((res) => {
        const allEvents = Array.isArray(res.data.events)
          ? res.data.events
          : res.data;

        if (student.events && Array.isArray(student.events)) {
          const joined = allEvents.filter((ev) => student.events.includes(ev.id));
          setEvents(joined);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error("Error loading events:", err);
        setEvents([]);
      });
  }, [student]);

  // === Saved Jobs ===
  useEffect(() => {
    if (!student?.username) return;

    const KEY = getSavedJobsKey(student.username);

    // migrate old global key if it exists
    const legacy = localStorage.getItem("savedJobs");
    if (legacy && !localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, legacy);
      localStorage.removeItem("savedJobs");
    }

    // load per-user jobs
    const jobs = JSON.parse(localStorage.getItem(KEY) || "[]");
    setSavedJobs(jobs);
  }, [student]);

  // === Load meetings AFTER username is known (avoids double-run wipe) ===
  useEffect(() => {
    if (!student?.username) return;
    const key = `meetings_${student.username}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    setMeetings(saved);
  }, [student?.username]);

  // === Persist meetings whenever they change (with a known username) ===
  useEffect(() => {
    if (!student?.username) return;
    const key = `meetings_${student.username}`;
    localStorage.setItem(key, JSON.stringify(meetings));
  }, [meetings, student?.username]);

  // === Pull application statuses from backend and merge into savedJobs ===
  useEffect(() => {
    if (!student?.username) return;

    (async () => {
      try {
        // no auth needed for this endpoint in your backend
        const res = await api.get(`/applications/${student.username}`);
        const apps = Array.isArray(res.data.applications) ? res.data.applications : [];

        if (!apps.length) return;

        const KEY = getSavedJobsKey(student.username);

        // merge statuses by (role=job_name) and (name=company_name)
        const merged = (savedJobs || []).map(j => {
          const hit = apps.find(a =>
            a.job_name?.toLowerCase() === (j.role || "").toLowerCase() &&
            (a.company_name || "").toLowerCase() === (j.name || "").toLowerCase()
          );
          return hit ? { ...j, status: hit.status } : j;
        });

        setSavedJobs(merged);
        localStorage.setItem(KEY, JSON.stringify(merged));
      } catch (err) {
        console.error("Failed to pull application statuses:", err);
      }
    })();
    // re-run when the student changes or jobs list changes
  }, [student?.username, savedJobs.length]);

  // === Load notifications ===
  useEffect(() => {
    if (!student) return;
    const token = localStorage.getItem("token");

    axios.get("http://127.0.0.1:8000/get_notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      setUnread(notifs.some(n => !n.read));
    })
    .catch(err => console.error("Failed to fetch notifications:", err));
  }, [student]);

  const handleMarkRead = async () => {
    if (!unread) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://127.0.0.1:8000/mark_notifications_read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnread(false);
      // update local read flags
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications:", err);
    }
  };

  // === Logout ===
  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  // === Update profile info ===
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(e.target);
    formData.append("username", student.username);

    try {
      const res = await axios.post("http://127.0.0.1:8000/update_profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updated = {
          ...student,
          about: formData.get("about"),
          university: formData.get("university"),
        };
        setStudent(updated);
        localStorage.setItem("student", JSON.stringify(updated));
        alert("✅ Profil ažuriran!");
      } else {
        alert("⚠️ Nije uspjelo ažuriranje profila.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Greška pri ažuriranju profila!");
    }
  };

  // === Upload image or CV ===
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(e.target);
    formData.append("username", student.username);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload_profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        const filename = res.data.filename;
        if (filename.endsWith(".pdf")) {
          alert("📄 CV uspješno učitan!");
          setStudent({ ...student, cv: filename });
        } else {
          alert("🖼️ Slika uspješno postavljena!");
          setProfileImage(`http://127.0.0.1:8000/profile_file/${filename}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Greška pri učitavanju datoteke!");
    }
  };

  // === Delete profile image ===
  const handleDeleteImage = async () => {
    if (!profileImage) return;
    const confirmDelete = window.confirm("Jeste li sigurni da želite ukloniti profilnu sliku?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/delete_profile_image",
        { username: student.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setProfileImage(null);
        alert("🗑️ Profilna slika obrisana!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Greška pri brisanju slike!");
    }
  };

  // === Moji poslovi ===
  const handleApply = (job) => {
    setSelectedJob(job);
    setUseSavedCV(!!student?.cv); // use saved CV if the student has one
    setFile(null);                // reset new CV input
    setCoverLetter(null);         // reset cover letter input
  };

  // stable key for job (works for real and demo jobs)
  const jobKey = (j) => (j.job_id != null ? `id:${j.job_id}` : `demo:${j.name}|${j.role}`);
  const unhideInConnect = (job) => {
    if (!student?.username) return;
    const HKEY = `hiddenJobs_${student.username}`;
    const arr = JSON.parse(localStorage.getItem(HKEY) || "[]");
    const k = jobKey(job);
    const next = arr.filter((x) => x !== k);
    localStorage.setItem(HKEY, JSON.stringify(next));
    // notify Connect (and any listeners) to refresh
    window.dispatchEvent(new Event("storage"));
  };


 const handleUploadApplication = async (e) => {
  e.preventDefault();
  if (!student?.username) return alert("Prvo se prijavite.");
  if (!coverLetter) return alert("Učitaj motivacijsko pismo (obavezno).");

  try {
    const token = localStorage.getItem("token");

    // 🟩 REPLACED this whole block with the improved FormData below:
    const form = new FormData();
    form.append("username", student.username);
    form.append("job_name", selectedJob.role);
    form.append("company_name", selectedJob.name);
    if (selectedJob.job_id != null) form.append("job_id", String(selectedJob.job_id)); // 👈 optional
    form.append("use_saved_cv", useSavedCV ? "true" : "false");
    form.append("cover_letter", coverLetter);
    if (!useSavedCV && file) form.append("cv_file", file);
    // 🟩 end of new block

    const res = await axios.post("http://127.0.0.1:8000/apply", form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!res.data?.success) throw new Error("Neuspjela prijava.");

    // ✅ Mark job as 'Poslano'
    const KEY = getSavedJobsKey(student.username);
    const updated = savedJobs.map((j) =>
      j.name === selectedJob.name ? { ...j, status: "Poslano" } : j
    );
    setSavedJobs(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));

    alert("✅ Prijava poslana!");
    setSelectedJob(null);
  } catch (err) {
    console.error(err);
    alert("❌ Greška pri slanju prijave!");
  }
};

const handleWithdraw = async (job) => {
  if (!student?.username) return;

  if (!window.confirm(`Želite li se odjaviti s posla: ${job.role} @ ${job.name}?`)) return;

  try {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("username", student.username);
    form.append("job_name", job.role);
    if (job.job_id != null) form.append("job_id", String(job.job_id));

    await axios.post("http://127.0.0.1:8000/withdraw_application", form, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 1) remove from "Moji poslovi"
    const KEY = getSavedJobsKey(student.username);
    const nextSaved = savedJobs.filter((j) => !(j.name === job.name && j.role === job.role));
    setSavedJobs(nextSaved);
    localStorage.setItem(KEY, JSON.stringify(nextSaved));

    // 2) unhide in Connect so it can appear again
    unhideInConnect(job);

    alert("✅ Uspješno ste se odjavili s posla.");
  } catch (err) {
    console.error(err);
    alert("❌ Greška pri odjavi s posla.");
  }
};

  const handleRemoveJob = (jobName) => {
    const updated = savedJobs.filter((j) => j.name !== jobName);
    setSavedJobs(updated);

    if (student?.username) {
      const KEY = getSavedJobsKey(student.username);
      localStorage.setItem(KEY, JSON.stringify(updated));
    }

    // 🔔 notify Connect page instantly
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
      {student ? (
        <>
          {/* === HEADER === */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-extrabold text-blue-700 tracking-tight">
              Dobrodošao, {student?.name?.split(" ")[0] || "student"}!
            </h2>

            {/* === Notifications Icon === */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  if (!showNotif) handleMarkRead();
                }}
                className="relative p-2 rounded-full hover:bg-blue-100 transition"
              >
                <Mail size={26} className="text-blue-700" />
                {unread && (
                  <span className="absolute top-1 right-1 block w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                  <div className="p-3 border-b text-gray-800 font-semibold">📩 Obavijesti</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 text-center">Nema obavijesti.</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={i}
                          className={`p-3 border-b last:border-0 ${
                            n.read ? "bg-white" : "bg-blue-50"
                          }`}
                        >
                          <p className="text-sm text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(n.created_at).toLocaleString("hr-HR")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === PROFILE SECTION === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* LEFT: PROFILE CARD */}
            <div className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center">
              <div className="flex flex-col items-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profilna slika"
                    className="w-32 h-32 rounded-full object-cover mb-3 border-4 border-blue-200 shadow"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-3 border border-gray-300">
                    <span className="text-gray-500">Nema slike</span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-800">{student.username}</h3>
                <p className="text-blue-600 font-medium">{student.university}</p>
                <p className="text-gray-600 italic mt-2">{student.about}</p>

                {/* Upload & Delete buttons */}
                <div className="mt-4 space-y-2">
                  <form
                    onSubmit={handleFileUpload}
                    encType="multipart/form-data"
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        name="file"
                        accept=".jpg,.jpeg,.png"
                        className="text-sm text-gray-700 text-center mx-auto block"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition mx-auto"
                    >
                      Postavi sliku
                    </button>
                  </form>

                  {profileImage && (
                    <button
                      onClick={handleDeleteImage}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
                    >
                      Ukloni sliku
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: EDIT PROFILE */}
            <div className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-bold mb-3 text-gray-800">Uredi profil</h3>
              <form onSubmit={handleProfileUpdate}>
                <label className="block mb-1 font-medium text-gray-700">O tebi:</label>
                <textarea
                  name="about"
                  defaultValue={student.about}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <label className="block mb-1 font-medium text-gray-700">Fakultet:</label>
                <input
                  name="university"
                  defaultValue={student.university}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition font-medium"
                >
                  Spremi promjene
                </button>
              </form>

              <hr className="my-5 border-gray-200" />

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Prenesi CV</h3>
              {student.cv ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-700">
                    📄 CV:
                    <a
                      href={`http://127.0.0.1:8000/profile_file/${student.cv}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline ml-1"
                    >
                      Preuzmi
                    </a>
                  </p>
                  <button
                    onClick={async () => {
                      const confirmDelete = window.confirm("Jeste li sigurni da želite ukloniti svoj CV?");
                      if (!confirmDelete) return;

                      const token = localStorage.getItem("token");
                      try {
                        const formData = new FormData();
                        formData.append("username", student.username);
                        await axios.post("http://127.0.0.1:8000/delete_cv", formData, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const updated = { ...student, cv: null };
                        setStudent(updated);
                        localStorage.setItem("student", JSON.stringify(updated));
                        alert("🗑️ CV obrisan!");
                      } catch (err) {
                        console.error(err);
                        alert("❌ Greška pri brisanju CV-a!");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs transition w-fit"
                  >
                    Ukloni CV
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFileUpload} encType="multipart/form-data">
                  <input type="file" name="file" accept=".pdf" className="mb-2" required />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
                  >
                    Učitaj CV
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* === JOBS SECTION === */}
          <div className="bg-white/90 p-6 rounded-2xl shadow-md mb-10 hover:shadow-lg transition">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              💼 Moji poslovi
            </h3>
            {savedJobs.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobs.map((job, i) => (
                  <motion.div
                    key={i}
                    className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-transform"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-xl font-semibold text-blue-700 mb-1">{job.name}</h4>
                    <p className="text-gray-700 font-medium">{job.role}</p>
                    <p className="text-gray-600 text-sm mb-2">{job.details}</p>
                    <p className="text-green-600 font-semibold mb-3">{job.pay}</p>
                    <div className="flex justify-between items-center">
                      {job.status ? (
                        <>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Status: {job.status}
                          </span>
                          <button
                            onClick={() => handleWithdraw(job)}
                            className="text-sm text-red-500 underline hover:text-red-700"
                          >
                            Odjavi se
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApply(job)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition"
                          >
                            Prijavi se
                          </button>
                          <button
                            onClick={() => handleRemoveJob(job.name)}
                            className="text-sm text-red-500 underline hover:text-red-700"
                          >
                            Ukloni
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Nema spremljenih poslova. Posjeti „Poveži se” i pronađi priliku!
              </p>
            )}
          </div>

          {/* === MODAL === */}
          <AnimatePresence>
            {selectedJob && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                >
                  <h3 className="text-2xl font-bold text-blue-700 mb-3">
                    Prijava za {selectedJob.name}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {selectedJob.role} — {selectedJob.details}
                  </p>

                  <form onSubmit={handleUploadApplication} className="space-y-4">
                    {/* === CV === */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">CV:</label>
                      {student?.cv ? (
                        <div className="rounded border p-3 bg-gray-50">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={useSavedCV}
                              onChange={(e) => setUseSavedCV(e.target.checked)}
                            />
                            <span>Koristi moj spremljeni CV</span>
                            <a
                              href={`http://127.0.0.1:8000/profile_file/${student.cv}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline ml-2"
                            >
                              Pregledaj
                            </a>
                          </label>

                          {!useSavedCV && (
                            <div className="mt-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="border p-2 w-full rounded text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Ovaj CV se koristi samo za ovu prijavu.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="border p-2 w-full rounded text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Nemaš spremljeni CV — učitaj CV za ovu prijavu.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* === COVER LETTER === */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Motivacijsko pismo (obavezno):
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCoverLetter(e.target.files[0])}
                        className="border p-2 w-full rounded text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full transition"
                    >
                      Pošalji prijavu
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="text-gray-500 underline w-full mt-2"
                    >
                      Odustani
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === CALENDAR SECTION === */}
          <div className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-lg transition mb-10">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              📅 Kalendar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* === LEFT: Calendar === */}
              <Calendar
                onClickDay={(date) => setSelectedDate(date)}
                value={selectedDate}
                className="rounded-lg shadow border border-gray-200 bg-white p-2"
                tileClassName={({ date, view }) => {
                  if (view !== "month") return undefined;
                  const day = date.toISOString().split("T")[0];
                  const hasEvent =
                    events.some((e) => {
                      const d = new Date(e.date);
                      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                      return d.toISOString().split("T")[0] === day;
                    }) || meetings.some((m) => m.date === day);
                  return hasEvent ? "event-day bg-blue-100 font-semibold text-blue-700 rounded-full" : undefined;
                }}
              />

              {/* === RIGHT: Selected Day Panel === */}
              <div className="p-5 border rounded-xl bg-gray-50 shadow-inner relative">
                <h4 className="text-xl font-bold mb-3 text-gray-800">
                  Zaduženja za {selectedDate.toLocaleDateString("hr-HR")}
                </h4>

                {/* === List of all events & meetings === */}
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-2">
                  {(() => {
                    const formatted = selectedDate.toISOString().split("T")[0];
                    const dayEvents = events.filter((e) => {
                      const d = new Date(e.date);
                      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                      return d.toISOString().split("T")[0] === formatted;
                    });
                    const dayMeetings = meetings.filter((m) => m.date === formatted);
                    const allItems = [...dayEvents, ...dayMeetings];

                    if (allItems.length === 0)
                      return (
                        <p className="text-gray-500 italic text-sm">
                          Nema događaja za ovaj dan.
                        </p>
                      );

                    return allItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition"
                      >
                        <div className="text-left">
                          <h5 className="font-semibold text-blue-700 text-sm">
                            {item.title}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>

                        {/* === If item is event (from backend) === */}
                        {item.location ? (
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token");
                                const form = new FormData();
                                form.append("username", student.username);
                                form.append("event_id", item.id);

                                await api.post("/unregister_event", form, {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "multipart/form-data",
                                  },
                                });

                                // ✅ Update student data locally
                                const updatedStudent = {
                                  ...student,
                                  events: student.events.filter((id) => id !== item.id),
                                };
                                localStorage.setItem("student", JSON.stringify(updatedStudent));
                                setStudent(updatedStudent);

                                // ✅ Update events list & UI instantly
                                const updated = events.filter((e) => e.id !== item.id);
                                setEvents(updated);
                                setSelectedDate(new Date(selectedDate));

                                alert("✅ Odjavljeni ste s događaja!");
                              } catch (err) {
                                console.error(err);
                                alert("❌ Greška pri odjavi s događaja.");
                              }
                            }}
                            className="text-red-600 text-xs hover:underline font-medium"
                          >
                            Odjavi se
                          </button>
                        ) : (
                          // === Otherwise it's a meeting (local) ===
                          <button
                            onClick={() => {
                              const updated = meetings.filter((m) => m.id !== item.id);
                              setMeetings(updated);
                              const key = `meetings_${student.username}`;
                              localStorage.setItem(key, JSON.stringify(updated));
                              setSelectedDate(new Date(selectedDate));
                              alert("✅ Sastanak uklonjen!");
                            }}
                            className="text-red-600 text-xs hover:underline font-medium"
                          >
                            Ukloni
                          </button>
                        )}
                      </div>
                    ));
                  })()}
                </div>

                {/* === Add new meeting === */}
                <div className="mt-4 border-t pt-3">
                  {!isAddingMeeting ? (
                    <button
                      onClick={() => setIsAddingMeeting(true)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ➕ Dodaj sastanak
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formatted = selectedDate.toISOString().split("T")[0];
                        const newMeeting = {
                          id: Date.now(),
                          title: meetingTitle,
                          description: meetingDescription,
                          date: formatted,
                        };
                        const updated = [...meetings, newMeeting];
                        setMeetings(updated);
                        const key = `meetings_${student.username}`;
                        localStorage.setItem(key, JSON.stringify(updated));
                        setMeetingTitle("");
                        setMeetingDescription("");
                        setIsAddingMeeting(false);
                        setSelectedDate(new Date(selectedDate));
                        alert("✅ Sastanak dodan!");
                      }}
                      className="mt-2 space-y-2"
                    >
                      <input
                        type="text"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Naslov sastanka"
                        className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        required
                      />
                      <textarea
                        value={meetingDescription}
                        onChange={(e) => setMeetingDescription(e.target.value)}
                        placeholder="Opis..."
                        className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        required
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingMeeting(false)}
                          className="text-gray-500 text-sm hover:underline"
                        >
                          Odustani
                        </button>
                        <button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                        >
                          Spremi
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* === LOGOUT BUTTON === */}
          <div className="text-right mt-8">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-medium transition"
            >
              Odjava
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-700 text-lg text-center">
          Molimo prijavite se za pristup nadzornoj ploči.
        </p>
      )}
    </div>
  );
}
