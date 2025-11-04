import { useEffect, useState } from "react";
import { getEvents, registerEvent, unregisterEvent } from "../services/api";


export default function Events() {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // Load events from backend
  useEffect(() => {
    getEvents()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.events || [];
        setEvents(data);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
      });
  }, []);

  // Load registered events from localStorage
  useEffect(() => {
    const studentData = JSON.parse(localStorage.getItem("student"));
    if (studentData && studentData.events) {
      setRegisteredEvents(studentData.events);
    }
  }, []);

    // Check if student is logged in
    const handleRegister = async (event) => {
        const studentData = JSON.parse(localStorage.getItem("student"));
        if (!studentData) {
            alert("Morate biti prijavljeni da biste se prijavili na događaj.");
            window.location.href = "/login";
            return;
        }

        try {
            await registerEvent(studentData.username, event.id);

            // 🔄 Fetch latest student info from backend after registering
            const res = await fetch(`http://127.0.0.1:8000/student/${studentData.username}`);
            const updated = await res.json();

            // Save updated student data in localStorage
            localStorage.setItem("student", JSON.stringify({ ...updated, username: studentData.username }));

            // Update state so button changes immediately
            setRegisteredEvents(updated.events || []);

            alert("Uspješno ste se prijavili na događaj!");
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnregister = async (event) => {
        const studentData = JSON.parse(localStorage.getItem("student"));
        if (!studentData) return;

        try {
            await unregisterEvent(studentData.username, event.id);

            // 🔄 Fetch latest student info after unregistering
            const res = await fetch(`http://127.0.0.1:8000/student/${studentData.username}`);
            const updated = await res.json();

            localStorage.setItem("student", JSON.stringify({ ...updated, username: studentData.username }));
            setRegisteredEvents(updated.events || []);

            alert("Uspješno ste odjavljeni s događaja.");
        } catch (e) {
            console.error(e);
        }
    };

  const isRegistered = (event) => {
    return registeredEvents.includes(event.id);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Nadolazeći događaji</h2>

      {events.length === 0 ? (
        <p className="text-gray-500">Nema dostupnih događaja.</p>
      ) : (
        <div className="space-y-6">
          {events.map((e) => (
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
