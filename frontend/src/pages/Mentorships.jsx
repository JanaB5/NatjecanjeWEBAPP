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
            className={`text-sm ${
              m.availability === "Open" ? "text-green-600" : "text-red-600"
            }`}
          >
            {m.availability}
          </span>
        </div>
      ))}
    </div>
  );
}
