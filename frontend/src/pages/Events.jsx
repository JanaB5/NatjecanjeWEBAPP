import { useEffect, useState } from "react";
import { getEvents, registerEvent, unregisterEvent } from "../services/api";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("Sveučilište u Zagrebu");

  // === Load events from backend ===
  useEffect(() => {
    getEvents()
      .then((res) => {
        const data = res.data?.events || res.data || [];
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
      });
  }, []);

  // === Load registered events from localStorage ===
  useEffect(() => {
    const studentData = JSON.parse(localStorage.getItem("student"));
    if (studentData && studentData.events) {
      setRegisteredEvents(studentData.events);
    }
  }, []);

  // === Handle register (join event) ===
  const handleRegister = async (event) => {
    const studentData = JSON.parse(localStorage.getItem("student"));
    if (!studentData) {
      alert("Morate biti prijavljeni da biste se prijavili na događaj.");
      window.location.href = "/login";
      return;
    }

    try {
      await registerEvent(studentData.username, event.id);

      // Update student events in localStorage
      const updatedEvents = [...(studentData.events || []), event.id];
      const updatedStudent = { ...studentData, events: updatedEvents };
      localStorage.setItem("student", JSON.stringify(updatedStudent));

      // Update state & refresh dashboard
      setRegisteredEvents(updatedEvents);
      window.dispatchEvent(new Event("storage")); // 🔁 notify dashboard

      alert("✅ Uspješno ste se prijavili na događaj!");
    } catch (e) {
      console.error("Greška pri prijavi:", e);
      alert("❌ Greška pri prijavi na događaj.");
    }
  };

  // === Handle unregister (leave event) ===
  const handleUnregister = async (event) => {
    const studentData = JSON.parse(localStorage.getItem("student"));
    if (!studentData) return;

    try {
      await unregisterEvent(studentData.username, event.id);

      // Update local student data
      const updatedEvents = (studentData.events || []).filter(
        (id) => id !== event.id
      );
      const updatedStudent = { ...studentData, events: updatedEvents };
      localStorage.setItem("student", JSON.stringify(updatedStudent));

      // Update state & refresh dashboard
      setRegisteredEvents(updatedEvents);
      window.dispatchEvent(new Event("storage")); // 🔁 notify dashboard

      alert("✅ Uspješno ste odjavljeni s događaja.");
    } catch (e) {
      console.error("Greška pri odjavi:", e);
      alert("❌ Greška pri odjavi s događaja.");
    }
  };


  const isRegistered = (event) => registeredEvents.includes(event.id);

  // === Faculties list for filtering ===
  const faculties = [
    "Sveučilište u Zagrebu",
    "FER",
    "PMF",
    "EFZG",
    "FFZG",
    "FSB",
    "FOI",
    "ALU",
    "ŠPUD"
  ];

  // === Filtered list ===
  const filteredEvents =
    selectedFaculty === "Sveučilište u Zagrebu"
      ? events
      : events.filter((e) => e.faculty === selectedFaculty);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Nadolazeći događaji</h2>

      {/* === Filter buttons === */}
      <div className="flex flex-wrap gap-3 mb-8">
        {faculties.map((fak) => (
          <button
            key={fak}
            onClick={() => setSelectedFaculty(fak)}
            className={`px-4 py-2 rounded-lg border ${
              selectedFaculty === fak
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            {fak}
          </button>
        ))}
      </div>

      {/* === Events === */}
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500">
          Nema događaja za odabrani fakultet.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((e) => (
            <div
              key={`${e.id}-${e.title}`}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <h3 className="text-xl font-semibold">{e.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{e.date}</p>
              <p className="mt-3">{e.description}</p>
              {e.location && (
                <p className="text-sm text-gray-500 mt-2">📍 {e.location}</p>
              )}
              {e.faculty && (
                <p className="text-xs text-gray-400 mt-1 italic">
                  🎓 {e.faculty}
                </p>
              )}

              {isRegistered(e) ? (
                <button
                  onClick={() => handleUnregister(e)}
                  className="mt-4 px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Odjavi se
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(e)}
                  className="mt-4 px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  Prijavi se
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
