import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function Connect() {
  const [faculty, setFaculty] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Učitaj trenutno prijavljenog studenta
  const student = JSON.parse(localStorage.getItem("student"));
  const username = student?.username || null;

  const [savedJobs, setSavedJobs] = useState(() => {
    if (!username) return [];
    return JSON.parse(localStorage.getItem(`savedJobs_${username}`) || "[]");
  });

  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (!username) return;
    const onStorage = () => {
      setSavedJobs(JSON.parse(localStorage.getItem(`savedJobs_${username}`) || "[]"));
      setHiddenJobs(JSON.parse(localStorage.getItem(`hiddenJobs_${username}`) || "[]"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [username]);

    // helper: stable key for a job
  const jobKey = (j) => (j.job_id != null ? `id:${j.job_id}` : `demo:${j.name}|${j.role}`);

  const HIDDEN_KEY = username ? `hiddenJobs_${username}` : null;
  const [hiddenJobs, setHiddenJobs] = useState(() => {
    if (!HIDDEN_KEY) return [];
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
  });
  // ✅ Dohvati oglase iz firmi
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/all_company_jobs");
      let allJobs = res.data.jobs || [];

      // 🟩 1️⃣ MAP BACKEND FIELDS → WHAT YOUR UI EXPECTS
      const mapped = allJobs.map((j) => ({
        name: j.company_name,
        role: j.title,
        details: j.description,
        pay: j.pay || "-",
        location: j.location || "",
        faculty: j.faculty || "",
        // use filename; we'll build full URL only when rendering
        logo: j.logo || null,
        job_id: j.job_id,
        company_username: j.company_username || null,
        posted_at: j.posted_at || null,
        category: j.industry || j.category || "",
      }));

      let filtered = mapped;

      // remove anything the user already saved/hidden
      const savedKeys = new Set((savedJobs || []).map(jobKey));
      const hiddenKeys = new Set((hiddenJobs || []).map(String));
      filtered = filtered.filter((j) => !savedKeys.has(jobKey(j)) && !hiddenKeys.has(jobKey(j)));

      if (category) {
        const c = category.toLowerCase();
        filtered = filtered.filter((j) => (j.category || "").toLowerCase().includes(c));
      }
      if (faculty) {
        const f = faculty.toLowerCase();
        filtered = filtered.filter((j) => {
          const fields = [j.faculty, j.location].filter(Boolean).map((x) => x.toLowerCase());
          return fields.some((x) => x.includes(f));
        });
      }

      // 🟩 5️⃣ SAVE RESULTS TO STATE
      setResults(filtered);
      setCurrentIndex(0);
      setShowCards(true);
    } catch (err) {
      console.error("Greška pri dohvaćanju oglasa:", err);
      alert("⚠️ Greška pri dohvaćanju oglasa!");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCards(false);
    }
  };

  const handleSave = () => {
    const job = results[currentIndex];
    if (!username) {
      alert("🔒 Morate biti prijavljeni da biste spremili posao!");
      return;
    }

    // save
    const updatedSaved = [...savedJobs, job];
    setSavedJobs(updatedSaved);
    localStorage.setItem(`savedJobs_${username}`, JSON.stringify(updatedSaved));

    // hide
    const key = jobKey(job);
    const updatedHidden = Array.from(new Set([...(hiddenJobs || []), key]));
    setHiddenJobs(updatedHidden);
    if (HIDDEN_KEY) localStorage.setItem(HIDDEN_KEY, JSON.stringify(updatedHidden));

    // remove from current deck
    const nextResults = results.filter((_, idx) => idx !== currentIndex);
    setResults(nextResults);
    setCurrentIndex((prev) => (prev >= nextResults.length ? nextResults.length - 1 : prev));
    if (nextResults.length === 0) setShowCards(false);
  };

  const requireLogin = () => {
    if (!username) {
      alert("🔒 Morate biti prijavljeni da biste koristili ovu opciju!");
      return false;
    }
    return true;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col justify-center items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!showCards ? (
        <motion.div
          className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-blue-700 mb-6 text-center">
            Career Connect Portal
          </h2>

          {/* FILTERI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">Fakultet:</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              >
                <option value="">-- Odaberi --</option>
                <option value="FER">FER</option>
                <option value="PMF">PMF</option>
                <option value="EFZG">EFZG</option>
                <option value="FFZG">FFZG</option>
                <option value="FAR">FAR</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Područje:</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">-- Odaberi --</option>
                <option value="IT">IT</option>
                <option value="AI">AI</option>
                <option value="Finance">Finance</option>
                <option value="Research">Research</option>
                <option value="Marketing">Marketing</option>
                <option value="Education">Education</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Psychology">Psychology</option>
                <option value="Translation">Translation</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all w-full md:w-auto"
          >
            {loading ? "Pretražujem..." : "Poveži me"}
          </button>

          {username && savedJobs.length > 0 && (
            <div className="mt-6 bg-green-50 border border-green-200 p-3 rounded text-green-700">
              ✅ Spremljeno poslova: <b>{savedJobs.length}</b>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="relative w-full max-w-3xl flex flex-col items-center justify-center">
          <AnimatePresence>
            {results[currentIndex] ? (
              <motion.div
                key={currentIndex}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* ✅ Prikaz podataka iz firmi */}
                <div className="flex flex-col items-center mb-3">
                  {results[currentIndex].logo && (
                    <img
                      src={`http://127.0.0.1:8000/profile_file/${results[currentIndex].logo}`}
                      alt="logo"
                      className="w-20 h-20 rounded-full object-cover mb-2 border"
                    />
                  )}
                  <h3 className="text-3xl font-bold text-blue-700 mb-1">
                    {results[currentIndex].role}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {results[currentIndex].name}
                  </p>
                  <p className="text-gray-600 mb-3">
                    {results[currentIndex].location}
                  </p>
                </div>

                <p className="text-gray-700 mb-4">
                  {results[currentIndex].details}
                </p>

                <p className="text-gray-500 text-sm">
                  🌐 {results[currentIndex].category}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white/90 p-8 rounded-2xl shadow-xl text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-2xl font-semibold text-gray-700">
                  Nema više ponuda!
                </h3>
                <button
                  onClick={() => setShowCards(false)}
                  className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                >
                  ↩️ Povratak na filtere
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STRELICE */}
          {results[currentIndex] && (
            <div className="flex gap-16 mt-8">
              <button
                onClick={() => {
                  if (!requireLogin()) return;
                  handleSkip();
                }}
                className="bg-red-100 text-red-600 rounded-full p-5 hover:bg-red-200 transition-all"
                title="Ne zanima me"
              >
                <XCircle size={36} />
              </button>

              <button
                onClick={() => {
                  if (!requireLogin()) return;
                  handleSave();
                }}
                className="bg-green-100 text-green-600 rounded-full p-5 hover:bg-green-200 transition-all"
                title="Spremi posao"
              >
                <CheckCircle size={36} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
