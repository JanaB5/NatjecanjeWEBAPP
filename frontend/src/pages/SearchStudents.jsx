import { useEffect, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchStudents() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dohvati sve studente (ili filtrirane)
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students${query ? `?query=${encodeURIComponent(query)}` : ""}`);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Greška pri dohvaćanju studenata:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detalji o pojedinom studentu
  const fetchStudentDetails = async (username) => {
    try {
      const res = await api.get(`/student_public/${username}`);
      setSelected(res.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju profila:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 md:p-10 overflow-hidden">
      {/* decorative blobs */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-20 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />

      {/* header */}
      <motion.div
        className="relative z-10 mb-6 md:mb-10"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 drop-shadow-sm flex items-center gap-3">
          <span>🔎</span> Pretraži studente
        </h1>
        <p className="text-gray-600 mt-2">
          Pronađi talente po imenu, fakultetu ili području interesa.
        </p>
      </motion.div>

      {/* search bar */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row gap-3 md:gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Pretraži po imenu ili fakultetu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 bg-white/90 backdrop-blur shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <motion.button
          onClick={fetchStudents}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          Pretraži
        </motion.button>
      </motion.div>

      {/* loading */}
      {loading && (
        <motion.div
          className="relative z-10 flex items-center gap-3 text-blue-700 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Učitavanje...
        </motion.div>
      )}

      {/* results */}
      <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map((s, idx) => (
          <motion.div
            key={s.username}
            className="bg-white/90 backdrop-blur p-5 rounded-2xl border border-blue-100 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex flex-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div className="flex items-start gap-4 mb-3">
              {s.profile_image ? (
                <img
                  src={`${api.defaults.baseURL}/profile_file/${s.profile_image}`}
                  alt={s.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-blue-50 shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                  {s.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                  {s.name}
                </h2>
                <p className="text-sm text-blue-700/80">{s.university}</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {s.about || "—"}
            </p>

            <div className="mt-auto flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => fetchStudentDetails(s.username)}
                className="text-blue-600 font-medium hover:underline"
              >
                Pogledaj profil
              </button>
              {s.cv && (
                <a
                  href={`${api.defaults.baseURL}/profile_file/${s.cv}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium hover:underline"
                >
                  📄 CV
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* empty state */}
      {!loading && students.length === 0 && (
        <motion.div
          className="relative z-10 mt-10 bg-white/90 backdrop-blur p-8 rounded-2xl border border-blue-100 shadow-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-600">Nema rezultata. Pokušaj s drugim upitom.</p>
        </motion.div>
      )}

      {/* modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-[90%] max-w-md p-8 border border-blue-100"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
                aria-label="Zatvori"
              >
                ✖
              </button>

              <div className="text-center">
                {selected.profile_image ? (
                  <img
                    src={`${api.defaults.baseURL}/profile_file/${selected.profile_image}`}
                    alt={selected.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-blue-50 shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold">
                    {selected.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-blue-700">{selected.name}</h2>
                <p className="text-gray-600">{selected.university}</p>
              </div>

              <p className="text-gray-700 text-sm mt-5 whitespace-pre-wrap leading-relaxed">
                {selected.about || "Nema opisa."}
              </p>

              {selected.cv && (
                <a
                  href={`${api.defaults.baseURL}/profile_file/${selected.cv}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                >
                  📄 Preuzmi CV
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
