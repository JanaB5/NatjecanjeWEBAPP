import { useState, useEffect } from "react";
import axios from "axios";

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
        setError("Neuspjelo učitavanje karijera. Pokušajte ponovno kasnije.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const careers = faculties[selectedFaculty] || [];

  if (loading) return <p>Učitavanje podataka...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Karijere po fakultetima</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <label className="font-semibold mr-2">Odaberi fakultet:</label>
        <select
          onChange={(e) => setSelectedFaculty(e.target.value)}
          className="border rounded px-3 py-2"
          value={selectedFaculty}
        >
          <option value="">-- Odaberi --</option>
          {Object.keys(faculties).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {selectedFaculty && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold mb-2">
            Moguće karijere nakon {selectedFaculty}:
          </h3>
          {careers.map((c, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500"
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
