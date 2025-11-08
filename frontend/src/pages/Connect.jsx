import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function Connect() {
  const [faculty, setFaculty] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const student = JSON.parse(localStorage.getItem("student"));
  const username = student?.username || null;

  const [savedJobs, setSavedJobs] = useState(() => {
    if (!username) return [];
    return JSON.parse(localStorage.getItem(`savedJobs_${username}`) || "[]");
  });

  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const HIDDEN_KEY = username ? `hiddenJobs_${username}` : null;
  const [hiddenJobs, setHiddenJobs] = useState(() => {
    if (!HIDDEN_KEY) return [];
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
  });

  useEffect(() => {
    if (!username) return;
    const onStorage = () => {
      setSavedJobs(JSON.parse(localStorage.getItem(`savedJobs_${username}`) || "[]"));
      setHiddenJobs(JSON.parse(localStorage.getItem(`hiddenJobs_${username}`) || "[]"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [username]);

  const jobKey = (j) => (j.job_id != null ? `id:${j.job_id}` : `demo:${j.name}|${j.role}`);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/all_company_jobs");
      let allJobs = res.data.jobs || [];
      const mapped = allJobs.map((j) => ({
        name: j.company_name,
        role: j.title,
        details: j.description,
        pay: j.pay || "-",
        location: j.location || "",
        faculty: j.faculty || "",
        logo: j.logo || null,
        job_id: j.job_id,
        company_username: j.company_username || null,
        posted_at: j.posted_at || null,
        category: j.industry || j.category || "",
      }));

      const savedKeys = new Set((savedJobs || []).map(jobKey));
      const hiddenKeys = new Set((hiddenJobs || []).map(String));
      let filtered = mapped.filter(
        (j) => !savedKeys.has(jobKey(j)) && !hiddenKeys.has(jobKey(j))
      );

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
    if (currentIndex < results.length - 1) setCurrentIndex((prev) => prev + 1);
    else setShowCards(false);
  };

  const handleSave = () => {
    const job = results[currentIndex];
    if (!username) {
      alert("🔒 Morate biti prijavljeni da biste spremili posao!");
      return;
    }

    const updatedSaved = [...savedJobs, job];
    setSavedJobs(updatedSaved);
    localStorage.setItem(`savedJobs_${username}`, JSON.stringify(updatedSaved));

    const key = jobKey(job);
    const updatedHidden = Array.from(new Set([...(hiddenJobs || []), key]));
    setHiddenJobs(updatedHidden);
    if (HIDDEN_KEY) localStorage.setItem(HIDDEN_KEY, JSON.stringify(updatedHidden));

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
      className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden p-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated background overlay */}
      <motion.div
        className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] z-0"
        animate={{ opacity: [0.6, 0.7, 0.6] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {!showCards ? (
        <motion.div
          className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-4xl w-full border border-blue-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-8 text-center drop-shadow-sm">
            Karijerni portal
          </h2>

          {/* Dropdown filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Fakultet:</label>
              <select
                className="border border-blue-200 rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              <label className="block font-semibold text-gray-800 mb-2">Područje:</label>
              <select
                className="border border-blue-200 rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

          <motion.button
            onClick={fetchData}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all w-full md:w-auto mx-auto block"
          >
            {loading ? "Pretražujem..." : "Poveži me"}
          </motion.button>

          {username && savedJobs.length > 0 && (
            <motion.div
              className="mt-6 bg-green-50 border border-green-200 p-4 rounded-xl text-green-700 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle className="text-green-600" size={20} />
              Spremljeno poslova: <b>{savedJobs.length}</b>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-center">
          <AnimatePresence>
            {results[currentIndex] ? (
              <motion.div
                key={currentIndex}
                className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full text-center border border-blue-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col items-center mb-4">
                  {results[currentIndex].logo && (
                    <img
                      src={`http://127.0.0.1:8000/profile_file/${results[currentIndex].logo}`}
                      alt="logo"
                      className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-blue-100 shadow-md"
                    />
                  )}
                  <h3 className="text-3xl font-bold text-blue-700 mb-1">
                    {results[currentIndex].role}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {results[currentIndex].name}
                  </p>
                  <p className="text-gray-600 mb-3">{results[currentIndex].location}</p>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {results[currentIndex].details}
                </p>

                <p className="text-gray-500 text-sm italic">
                  🌐 {results[currentIndex].category}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white/90 p-10 rounded-3xl shadow-xl text-center border border-blue-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-2xl font-semibold text-gray-700">
                  Nema više ponuda!
                </h3>
                <button
                  onClick={() => setShowCards(false)}
                  className="mt-5 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 shadow-md"
                >
                  ↩️ Povratak na filtere
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {results[currentIndex] && (
            <div className="flex gap-16 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!requireLogin()) return;
                  handleSkip();
                }}
                className="bg-red-100 text-red-600 rounded-full p-5 hover:bg-red-200 shadow-md transition-all"
                title="Ne zanima me"
              >
                <XCircle size={36} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!requireLogin()) return;
                  handleSave();
                }}
                className="bg-green-100 text-green-600 rounded-full p-5 hover:bg-green-200 shadow-md transition-all"
                title="Spremi posao"
              >
                <CheckCircle size={36} />
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
