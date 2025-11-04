import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { getEvents } from "../services/api";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (stored) {
      axios
        .get(`http://127.0.0.1:8000/student/${stored.username}`)
        .then((res) => {
          const updated = { ...res.data, username: stored.username };
          localStorage.setItem("student", JSON.stringify(updated));
          setStudent(updated);
        })
        .catch(() => setStudent(stored));
    }
  }, [location.pathname]);

  useEffect(() => {
    getEvents().then((res) => {
      const all = Array.isArray(res.data) ? res.data : [];
      const user = JSON.parse(localStorage.getItem("student"));
      if (user?.events) {
        const joined = all.filter((ev) => user.events.includes(ev.id));
        setEvents(joined);
      }
    });
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    window.location.href = "/login";
  };

  return (
    <div className="p-6">
      {student ? (
        <>
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            Dobrodošao, {student?.name?.split(" ")[0] || "student"}!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Tvoj profil</h3>
              <p><strong>Fakultet:</strong> {student.university}</p>
              <p className="mt-1"><strong>O tebi:</strong> {student.about}</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Tvoji mentori</h3>
              {student.connections?.length ? (
                student.connections.map((m, i) => (
                  <p key={i} className="text-gray-700 border-b py-1">{m}</p>
                ))
              ) : (
                <p className="text-gray-500">Nema povezanih mentora.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Tvoji nadolazeći događaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  tileClassName={({ date }) =>
                    events.some((e) => e.date === date.toISOString().split("T")[0])
                      ? "bg-blue-200 rounded-full"
                      : ""
                  }
                />
              </div>
              <div>
                {events.length ? (
                  events.map((e) => (
                    <div key={e.id} className="mb-3">
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-gray-600">{e.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nema prijavljenih događaja.</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Odjava
          </button>
        </>
      ) : (
        <p>Molimo prijavite se za pristup nadzornoj ploči.</p>
      )}
    </div>
  );
}
