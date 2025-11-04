import { useEffect, useState } from "react";
import { getMentorships } from "../services/api";

export default function Mentorships() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    getMentorships().then((res) => setMentors(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Mentorship Programs</h2>
      {mentors.map((m) => (
        <div key={m.id} className="border p-4 rounded mb-3 bg-white shadow-sm">
          <h3 className="font-semibold text-lg">{m.mentor}</h3>
          <p className="text-gray-600">{m.field}</p>
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
                m.availability === "Open" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {m.availability}
          </span>
          <p className="text-gray-600 mt-1">{m.experience}</p>
        </div>
      ))}
    </div>
  );
}
