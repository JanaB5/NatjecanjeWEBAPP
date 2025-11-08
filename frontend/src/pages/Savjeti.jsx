import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 overflow-hidden">
      {/* Decorative Background */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 blur-3xl rounded-full -z-10"
        animate={{ y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-200/30 blur-3xl rounded-full -z-10"
        animate={{ y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />

      {/* Header */}
      <motion.h2
        className="text-5xl font-extrabold text-center text-blue-700 mb-10 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Savjeti i pitanja studenata
      </motion.h2>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-3xl mx-auto mb-12 border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <label className="block font-semibold text-gray-800 mb-2">
          Postavi pitanje ili savjet:
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Kako pronaći praksu na FER-u?"
          className="w-full border border-blue-200 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          rows="3"
        ></textarea>

        <label className="block font-semibold text-gray-800 mb-2">
          Dodaj tagove (npr. FER, EFZG):
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="FER, AI, karijera"
          className="w-full border border-blue-200 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 transition-all"
        >
          Objavi
        </motion.button>
      </motion.form>

      {/* Filter Section */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-semibold mb-3 text-gray-700">Filtriraj po tagovima:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === ""
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 hover:bg-blue-100 text-blue-700"
            }`}
          >
            Sve
          </button>
          {allTags.map((t, i) => (
            <button
              key={i}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === t
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-blue-100 text-blue-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {filtered.length > 0 ? (
          filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-100 transition-all hover:shadow-2xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <p className="text-lg text-gray-800 mb-3">{s.question}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {s.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {s.replies && s.replies.length > 0 && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  {s.replies.map((r, i) => (
                    <motion.div
                      key={i}
                      className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-gray-700"
                      whileHover={{ scale: 1.02 }}
                    >
                      <strong className="text-blue-800">{r.username}:</strong>{" "}
                      {r.reply}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={replyText[s.id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [s.id]: e.target.value })
                  }
                  placeholder="Odgovori..."
                  className="flex-grow border border-blue-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <motion.button
                  onClick={() => handleReply(s.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md"
                >
                  Odgovori
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-center text-gray-500 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nema objavljenih savjeta.
          </motion.p>
        )}
      </div>
    </div>
  );
}
