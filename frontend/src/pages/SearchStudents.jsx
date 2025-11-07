import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function SearchStudents() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dohvati sve studente (ili filtrirane)
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students${query ? `?query=${query}` : ""}`);
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
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-blue-700 mb-6">
        🔍 Pretraži studente
      </h1>

      {/* Search bar */}
      <div className="flex mb-6 space-x-2">
        <input
          type="text"
          placeholder="Pretraži po imenu ili fakultetu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2"
        />
        <button
          onClick={fetchStudents}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pretraži
        </button>
      </div>

      {/* Loading indicator */}
      {loading && <p className="text-gray-600">Učitavanje...</p>}

      {/* Rezultati pretrage */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((s) => (
          <div
            key={s.username}
            className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {s.profile_image ? (
                  <img
                    src={`${api.defaults.baseURL}/profile_file/${s.profile_image}`}
                    alt={s.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    ?
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{s.name}</h2>
                  <p className="text-sm text-gray-600">{s.university}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{s.about}</p>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => fetchStudentDetails(s.username)}
                className="text-blue-600 hover:underline"
              >
                Pogledaj profil
              </button>
              {s.cv && (
                <a
                  href={`${api.defaults.baseURL}/profile_file/${s.cv}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  📄 CV
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal za detalje studenta */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-lg"
            >
              ✖
            </button>

            <div className="text-center">
              {selected.profile_image ? (
                <img
                  src={`${api.defaults.baseURL}/profile_file/${selected.profile_image}`}
                  alt={selected.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center text-gray-500">
                  ?
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {selected.name}
              </h2>
              <p className="text-gray-600">{selected.university}</p>
            </div>

            <p className="text-gray-700 text-sm mt-4 whitespace-pre-wrap">
              {selected.about || "Nema opisa."}
            </p>

            {selected.cv && (
              <a
                href={`${api.defaults.baseURL}/profile_file/${selected.cv}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                📄 Preuzmi CV
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
