import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Karijere() {
  const [faculties, setFaculties] = useState({});
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/careers");
        setFaculties(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching careers:", err);
        setError("Neuspjelo učitavanje podataka. Pokušajte ponovno kasnije.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 font-semibold text-xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mr-3"
        ></motion.div>
        Učitavanje...
      </div>
    );

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  const facultyNames = Object.keys(faculties);
  const selectedData = faculties[selectedFaculty];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 overflow-hidden">
      {/* Decorative background shapes */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="absolute -bottom-32 -right-24 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />

      {/* === Intro Section === */}
      <motion.div
        className="text-center mb-14 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-md">
          Karijere po fakultetima
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
          Sveučilište u Zagrebu okuplja brojne fakultete koji nude različite mogućnosti
          za razvoj karijere. Istraži svoje mogućnosti, saznaj više o fakultetima i
          poslušaj riječi mentora koji oblikuju buduće lidere.
        </p>
      </motion.div>

      {/* === Faculty Tabs === */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mb-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {facultyNames.map((f) => (
          <motion.button
            key={f}
            onClick={() => setSelectedFaculty(f)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all shadow-sm ${
              selectedFaculty === f
                ? "bg-blue-600 text-white shadow-xl scale-105"
                : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-100"
            }`}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      {/* === Selected Faculty Info === */}
      {selectedFaculty && selectedData ? (
        <motion.div
          key={selectedFaculty}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-blue-100"
        >
          <motion.h3
            className="text-3xl font-bold text-blue-700 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {selectedFaculty}
          </motion.h3>

          <motion.p
            className="text-gray-700 mb-8 text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedData.about}
          </motion.p>

          <motion.h4
            className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            💼 Moguće karijere:
          </motion.h4>

          <motion.ul
            className="grid sm:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {selectedData.careers.map((career, i) => (
              <motion.li
                key={i}
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                whileHover={{ scale: 1.03 }}
              >
                <span className="font-medium text-gray-800">{career}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.blockquote
            className="italic text-gray-700 bg-yellow-50 border-l-4 border-yellow-400 pl-5 py-3 rounded-md shadow-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            “{selectedData.mentor_quote}”
          </motion.blockquote>
        </motion.div>
      ) : (
        <motion.p
          className="text-center text-gray-500 italic mt-10 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Odaberi fakultet kako bi saznao više o karijerama i mentorima.
        </motion.p>
      )}
    </div>
  );
}
