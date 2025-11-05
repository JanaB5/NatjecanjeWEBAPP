import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { api, getEvents } from "../services/api";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (stored) {
      api
        .get(`/student/${stored.username}`)
        .then((res) => {
          const updated = { ...res.data, username: stored.username };
          localStorage.setItem("student", JSON.stringify(updated));
          setStudent(updated);
          if (res.data.profile_image) {
            setProfileImage(`http://127.0.0.1:8000/profile_file/${res.data.profile_image}`);
          }
        })
        .catch((err) => {
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            localStorage.removeItem("student");
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else {
            setStudent(stored);
          }
        });
    }

    // Učitavanje spremljenih poslova
    const jobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(jobs);
  }, [location.pathname]);

  useEffect(() => {
    getEvents().then((res) => {
      const all = Array.isArray(res.data) ? res.data : [];
      const user = JSON.parse(localStorage.getItem("student"));
      if (user?.events) {
        const joined = all.filter((ev) => user.events.includes(ev.id));
        setEvents(joined);
      }
    });
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("token");
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

  // === Add meeting ===
  const handleAddMeeting = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("username", student.username);
    formData.append("title", meetingTitle);
    formData.append("description", meetingDescription);
    formData.append("date", selectedDate.toISOString().split("T")[0]);

    try {
      const res = await axios.post("http://127.0.0.1:8000/add_meeting", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMeetings(res.data.meetings);
        setMeetingTitle("");
        setMeetingDescription("");
        alert("✅ Sastanak dodan!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Greška pri dodavanju sastanka!");
    }
  };

  // === Moji poslovi ===
  const handleApply = (job) => {
    setSelectedJob(job);
  };

  const handleUploadApplication = async (e) => {
    e.preventDefault();
    if (!file) return alert("Odaberi CV datoteku!");
    const form = new FormData();
    form.append("username", student.username);
    form.append("file", file);
    try {
      await api.post("/upload_profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Prijava uspješno poslana!");
      setSelectedJob(null);
      setFile(null);
    } catch (err) {
      alert("❌ Greška pri slanju prijave!");
    }
  };

  const handleRemoveJob = (jobName) => {
    const updated = savedJobs.filter((j) => j.name !== jobName);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      {student ? (
        <>
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            Dobrodošao, {student?.name?.split(" ")[0] || "student"}!
          </h2>

          {/* PROFIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* LEFT PROFILE CARD */}
            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <div className="flex flex-col items-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profilna slika"
                    className="w-32 h-32 object-cover rounded-full mb-3 border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                    <span className="text-gray-500">Nema slike</span>
                  </div>
                )}

                <h3 className="text-xl font-semibold">{student.username}</h3>
                <p className="text-gray-600">{student.university}</p>
                <p className="text-gray-500 italic mt-1">{student.about}</p>

                {/* Upload & Delete buttons */}
                <div className="mt-4">
                  <form
                    onSubmit={handleFileUpload}
                    encType="multipart/form-data"
                    className="flex flex-col items-center"
                  >
                    <input
                      type="file"
                      name="file"
                      accept=".jpg,.jpeg,.png"
                      className="mb-2 text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Postavi sliku
                    </button>
                  </form>

                  {profileImage && (
                    <button
                      onClick={handleDeleteImage}
                      className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Ukloni sliku
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT EDIT PROFILE */}
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Uredi profil</h3>
              <form onSubmit={handleProfileUpdate}>
                <label className="block mb-2 font-medium">O tebi:</label>
                <textarea
                  name="about"
                  defaultValue={student.about}
                  className="w-full border rounded p-2 mb-3"
                />
                <label className="block mb-2 font-medium">Fakultet:</label>
                <input
                  name="university"
                  defaultValue={student.university}
                  className="w-full border rounded p-2 mb-3"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Spremi promjene
                </button>
              </form>

              <hr className="my-4" />

              <h3 className="text-lg font-semibold mb-2">Prenesi CV</h3>
              <form onSubmit={handleFileUpload} encType="multipart/form-data">
                <input type="file" name="file" accept=".pdf" className="mb-2" required />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Učitaj CV
                </button>
              </form>

              {student.cv && (
                <p className="mt-2 text-sm text-gray-700">
                  📄 CV:{" "}
                  <a
                    href={`http://127.0.0.1:8000/profile_file/${student.cv}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Preuzmi CV
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* MOJI POSLOVI */}
          <div className="bg-white p-5 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">💼 Moji poslovi</h3>
            {savedJobs.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs.map((job, i) => (
                  <motion.div
                    key={i}
                    className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-xl font-semibold text-blue-700 mb-1">
                      {job.name}
                    </h4>
                    <p className="text-gray-700 font-medium">{job.role}</p>
                    <p className="text-gray-600 text-sm mb-2">{job.details}</p>
                    <p className="text-green-600 font-semibold mb-2">{job.pay}</p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleApply(job)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Prijavi se
                      </button>
                      <button
                        onClick={() => handleRemoveJob(job.name)}
                        className="text-sm text-red-500 underline"
                      >
                        Ukloni
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Nema spremljenih poslova. Posjeti „Poveži se” i pronađi priliku!
              </p>
            )}
          </div>

          {/* MODAL ZA PRIJAVU */}
          <AnimatePresence>
            {selectedJob && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md"
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

                  <form onSubmit={handleUploadApplication} className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-600">
                      Učitaj svoj CV:
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="border p-2 w-full rounded"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
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

          {/* KALENDAR + SASTANCI */}
          <div className="bg-white p-5 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Dodaj sastanak</h3>
            <form onSubmit={handleAddMeeting}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Calendar onChange={setSelectedDate} value={selectedDate} />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Naslov sastanka:</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                    required
                  />
                  <label className="block mb-2 font-medium">Opis:</label>
                  <textarea
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Dodaj sastanak
                  </button>
                </div>
              </div>
            </form>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Odjava
          </button>
        </>
      ) : (
        <p>Molimo prijavite se za pristup nadzornoj ploči.</p>
      )}
    </div>
  );
}
