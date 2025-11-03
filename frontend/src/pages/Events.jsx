import { useEffect, useState } from "react";
import { getEvents } from "../services/api";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents()
      .then((res) => {
        // Make sure we actually get an array
        const data = Array.isArray(res.data) ? res.data : res.data?.events || [];
        setEvents(data);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Upcoming Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        events.map((e) => (
          <div key={e.id} className="border p-4 rounded mb-3 bg-white shadow-sm">
            <p className="font-semibold">{e.title}</p>
            <p className="text-gray-600">{e.date}</p>
          </div>
        ))
      )}
    </div>
  );
}
