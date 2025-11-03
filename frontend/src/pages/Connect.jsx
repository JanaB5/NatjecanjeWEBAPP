import { useState } from "react";

const mockMatches = [
  {
    faculty: "FER",
    type: "Mentor",
    name: "Ivan Radić",
    role: "Software Engineer at Infobip",
  },
  {
    faculty: "EFZG",
    type: "Job",
    name: "Ana Petrović",
    role: "HR Recruiter at Deloitte",
  },
  {
    faculty: "PMF",
    type: "Advice",
    name: "Dr. Luka Novak",
    role: "Career Counselor, University of Zagreb",
  },
];

export default function Connect() {
  const [faculty, setFaculty] = useState("");
  const [type, setType] = useState("");
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const findMatch = () => {
    const found =
      mockMatches.find((m) => m.faculty === faculty && m.type === type) || null;
    setMatch(found);
    setMessages([]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: "you", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "them",
          text:
            match?.type === "Mentor"
              ? "Drago mi je da si se javio! Kako ti mogu pomoći u karijeri?"
              : match?.type === "Job"
              ? "Pošalji mi svoj CV, pa ćemo provjeriti otvorene pozicije!"
              : "Rado ću ti dati savjet o studiranju i karijeri!",
        },
      ]);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Career Connect Chat
      </h2>

      {/* Step 1: Selection */}
      {!match && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block font-semibold mb-1">Fakultet:</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            >
              <option value="">-- Odaberi --</option>
              <option value="FER">FER</option>
              <option value="EFZG">EFZG</option>
              <option value="PMF">PMF</option>
              <option value="FFZG">FFZG</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Što tražiš?
            </label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">-- Odaberi --</option>
              <option value="Mentor">Mentora</option>
              <option value="Job">Posao</option>
              <option value="Advice">Savjet</option>
            </select>
          </div>

          <button
            onClick={findMatch}
            disabled={!faculty || !type}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 w-full"
          >
            Poveži me
          </button>
        </div>
      )}

      {/* Step 2: Chat */}
      {match && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-600">
              Povezan si s {match.name}
            </h3>
            <p className="text-gray-600">{match.role}</p>
          </div>

          <div className="border rounded h-80 p-3 overflow-y-auto mb-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`my-2 ${
                  m.from === "you" ? "text-right text-blue-600" : "text-left text-gray-800"
                }`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-lg ${
                    m.from === "you"
                      ? "bg-blue-100"
                      : "bg-gray-200"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napiši poruku..."
              className="flex-1 border rounded px-3 py-2"
            />
            <button className="bg-blue-600 text-white px-4 rounded">
              Pošalji
            </button>
          </form>

          <button
            onClick={() => setMatch(null)}
            className="text-sm text-gray-500 mt-3 underline"
          >
            ↩️ Vrati se na odabir
          </button>
        </div>
      )}
    </div>
  );
}
