import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

      const updatedEvents = [...(studentData.events || []), event.id];
      const updatedStudent = { ...studentData, events: updatedEvents };
      localStorage.setItem("student", JSON.stringify(updatedStudent));

      setRegisteredEvents(updatedEvents);
      window.dispatchEvent(new Event("storage"));

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

      const updatedEvents = (studentData.events || []).filter((id) => id !== event.id);
      const updatedStudent = { ...studentData, events: updatedEvents };
      localStorage.setItem("student", JSON.stringify(updatedStudent));

      setRegisteredEvents(updatedEvents);
      window.dispatchEvent(new Event("storage"));

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
    "ŠPUD",
  ];

  // === Filtered list ===
  const filteredEvents =
    selectedFaculty === "Sveučilište u Zagrebu"
      ? events
      : events.filter((e) => e.faculty === selectedFaculty);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 md:p-10 overflow-hidden">
      {/* Soft background blobs */}
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

      {/* Hero */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-700 drop-shadow-sm">
          Nadolazeći događaji
        </h2>
        <p className="text-gray-600 mt-2">
          Prijavi se na sajmove karijera, radionice i događanja na svom fakultetu.
        </p>
      </motion.div>

      {/* Filter buttons */}
      <motion.div
        className="relative z-10 flex flex-wrap gap-3 mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {faculties.map((fak) => (
          <motion.button
            key={fak}
            onClick={() => setSelectedFaculty(fak)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition-all ${
              selectedFaculty === fak
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
            }`}
          >
            {fak}
          </motion.button>
        ))}
      </motion.div>

      {/* Events list */}
      <div className="relative z-10">
        {filteredEvents.length === 0 ? (
          <motion.div
            className="text-gray-500 bg-white/80 backdrop-blur p-8 rounded-2xl border border-blue-100 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nema događaja za odabrani fakultet.
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((e, idx) => (
              <motion.div
                key={`${e.id}-${e.title}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="relative bg-white/90 backdrop-blur rounded-2xl p-6 md:p-7 border border-blue-100 shadow-xl hover:shadow-2xl transition-all"
              >
                {/* Accent line + dot */}
                <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-gradient-to-b from-blue-500 to-blue-300 rounded-r-full" />
                <div className="absolute -left-2 top-6 w-4 h-4 bg-blue-600 rounded-full shadow" />

                <div className="pl-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                      {e.title}
                    </h3>
                    {/* Faculty chip */}
                    {e.faculty && (
                      <span className="px-3 py-1 rounded-full text-xs md:text-sm bg-blue-50 text-blue-700 border border-blue-200">
                        🎓 {e.faculty}
                      </span>
                    )}
                  </div>

                  {e.date && (
                    <p className="text-sm text-gray-500 mt-1">📅 {e.date}</p>
                  )}

                  {e.description && (
                    <p className="mt-3 text-gray-700 leading-relaxed">{e.description}</p>
                  )}

                  {e.location && (
                    <p className="text-sm text-gray-600 mt-2">📍 {e.location}</p>
                  )}

                  <div className="mt-5 flex items-center gap-3">
                    {isRegistered(e) ? (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleUnregister(e)}
                        className="px-5 py-2.5 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold shadow-md"
                      >
                        Odjavi se
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleRegister(e)}
                        className="px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-md"
                      >
                        Prijavi se
                      </motion.button>
                    )}

                    {/* Secondary details badges */}
                    {e.audience && (
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border">
                        👥 {e.audience}
                      </span>
                    )}
                    {e.cost && (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        💸 {e.cost}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
