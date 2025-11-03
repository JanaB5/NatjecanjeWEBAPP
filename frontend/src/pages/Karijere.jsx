import { useState } from "react";

const faculties = {
  FER: ["Software Engineer", "Data Scientist", "AI Researcher"],
  EFZG: ["Marketing Manager", "Accountant", "Business Analyst"],
  PMF: ["Lab Technician", "Data Analyst", "Environmental Scientist"],
  FFZG: ["Teacher", "Psychologist", "Translator"],
};

export default function Karijere() {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const careers = faculties[selectedFaculty] || [];

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
            <div key={i} className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
