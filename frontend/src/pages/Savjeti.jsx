import { useEffect, useState } from "react";
import axios from "axios";

export default function Savjeti() {
  const [savjeti, setSavjeti] = useState([]);
  const [question, setQuestion] = useState("");
  const [tags, setTags] = useState("");
  const [replyText, setReplyText] = useState({});
  const [filter, setFilter] = useState("");
  const student = JSON.parse(localStorage.getItem("student"));

  useEffect(() => {
    loadSavjeti();
  }, []);

  const loadSavjeti = () => {
    axios
      .get("http://127.0.0.1:8000/savjeti")
      .then((res) => setSavjeti(res.data))
      .catch((err) => console.error("Error fetching savjeti:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      alert("Morate biti prijavljeni da biste objavili savjet ili pitanje.");
      window.location.href = "/login";
      return;
    }
    if (!question.trim() || !tags.trim()) return;

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("tags", tags);

      const res = await axios.post("http://127.0.0.1:8000/savjeti", formData);
      setSavjeti([...savjeti, res.data.savjet]);
      setQuestion("");
      setTags("");
    } catch (err) {
      console.error("Error adding savjet:", err);
    }
  };

  const handleReply = async (postId) => {
    if (!student) {
      alert("Morate biti prijavljeni da biste odgovorili.");
      window.location.href = "/login";
      return;
    }
    const reply = replyText[postId];
    if (!reply || !reply.trim()) return;

    try {
      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("username", student.username);
      formData.append("reply", reply);

      await axios.post("http://127.0.0.1:8000/savjeti/reply", formData);
      setReplyText({ ...replyText, [postId]: "" });
      loadSavjeti();
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const filtered = filter
    ? savjeti.filter((s) => s.tags.includes(filter))
    : savjeti;

  const allTags = [
    ...new Set(savjeti.flatMap((s) => s.tags.map((t) => t.trim()))),
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Savjeti i pitanja studenata
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-lg shadow-md mb-6"
      >
        <label className="block font-semibold mb-2">
          Postavi pitanje ili savjet:
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Kako pronaći praksu na FER-u?"
          className="w-full border rounded p-2 mb-3"
          rows="3"
        ></textarea>

        <label className="block font-semibold mb-2">
          Dodaj tagove (npr. FER, EFZG):
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="FER, AI, karijera"
          className="w-full border rounded p-2 mb-4"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Objavi
        </button>
      </form>

      {/* Filter by tags */}
      <div className="mb-6">
        <p className="font-semibold mb-2">Filtriraj po tagovima:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1 rounded ${
              filter === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Sve
          </button>
          {allTags.map((t, i) => (
            <button
              key={i}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded ${
                filter === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <p className="text-gray-800 mb-2">{s.question}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {s.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Replies */}
              {s.replies && s.replies.length > 0 && (
                <div className="mt-4 border-t pt-3 space-y-2">
                  {s.replies.map((r, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-2 rounded border text-sm"
                    >
                      <strong>{r.username}:</strong> {r.reply}
                    </div>
                  ))}
                </div>
              )}

              {/* Reply box */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyText[s.id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [s.id]: e.target.value })
                  }
                  placeholder="Odgovori..."
                  className="flex-grow border rounded p-2 text-sm"
                />
                <button
                  onClick={() => handleReply(s.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                >
                  Odgovori
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nema objavljenih savjeta.</p>
        )}
      </div>
    </div>
  );
}
