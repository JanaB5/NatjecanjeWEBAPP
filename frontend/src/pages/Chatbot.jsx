import { useState } from "react";
import { sendChatMessage } from "../services/api";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChat([...chat, userMsg]);
    setMessage("");

    const res = await sendChatMessage(message);
    const botMsg = { role: "bot", text: res.data.reply };
    setChat((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-5 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">AI Career Assistant</h2>

      <div className="h-80 overflow-y-auto border p-3 mb-3 bg-gray-50 rounded">
        {chat.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === "user" ? "text-right text-blue-600" : "text-left text-gray-800"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me about careers..."
        />
        <button className="bg-blue-600 text-white px-4 rounded">Send</button>
      </form>
    </div>
  );
}
