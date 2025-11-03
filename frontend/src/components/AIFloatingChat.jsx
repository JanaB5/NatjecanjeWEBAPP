import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { sendChatMessage } from "../services/api";

export default function AIFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChat([...chat, userMsg]);
    setMessage("");

    try {
      const res = await sendChatMessage(message);
      const botMsg = { role: "bot", text: res.data.reply };
      setChat((prev) => [...prev, botMsg]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "AI asistent trenutno nije dostupan." },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-lg border flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">
            AI Karijerni Asistent
          </div>

          <div className="flex-1 p-3 overflow-y-auto h-64 text-sm">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`my-1 ${
                  m.role === "user" ? "text-right text-blue-600" : "text-left text-gray-700"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    m.role === "user" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex border-t">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              placeholder="Postavi pitanje..."
            />
            <button className="bg-blue-600 text-white px-3 text-sm hover:bg-blue-700">
              Pošalji
            </button>
          </form>
        </div>
      )}
    </>
  );
}
