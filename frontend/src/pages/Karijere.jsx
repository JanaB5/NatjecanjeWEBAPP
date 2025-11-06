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

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const facultyNames = Object.keys(faculties);
  const selectedData = faculties[selectedFaculty];

  return (
    <div className="p-6">
      {/* === Intro Section === */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-blue-700 mb-4">Karijere po fakultetima</h2>
        <p className="text-gray-700 max-w-3xl mx-auto">
          Sveučilište u Zagrebu okuplja brojne fakultete koji nude različite mogućnosti za
          razvoj karijere. Istraži svoje mogućnosti, saznaj više o fakultetima i poslušaj
          riječi mentora koji oblikuju buduće lidere.
        </p>
      </div>

      {/* === Faculty Tabs === */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {facultyNames.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFaculty(f)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedFaculty === f
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 hover:bg-blue-100 text-blue-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* === Selected Faculty Info === */}
      {selectedFaculty && selectedData && (
        <motion.div
          key={selectedFaculty}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-blue-700 mb-3">{selectedFaculty}</h3>
          <p className="text-gray-700 mb-6">{selectedData.about}</p>

          <h4 className="text-lg font-semibold text-gray-800 mb-2">💼 Moguće karijere:</h4>
          <ul className="space-y-2 mb-6">
            {selectedData.careers.map((career, i) => (
              <li
                key={i}
                className="bg-gray-50 border-l-4 border-blue-500 p-3 rounded shadow-sm"
              >
                {career}
              </li>
            ))}
          </ul>

          <blockquote className="italic text-gray-600 border-l-4 border-yellow-400 pl-4">
            {selectedData.mentor_quote}
          </blockquote>
        </motion.div>
      )}

      {!selectedFaculty && (
        <p className="text-center text-gray-500 italic mt-10">
          Odaberi fakultet kako bi saznao više o karijerama i mentorima.
        </p>
      )}
    </div>
  );
}
