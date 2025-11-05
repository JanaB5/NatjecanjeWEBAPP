import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", name: "", university: "", about: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/register", new FormData(e.target));
      if (res.data.success) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("student", JSON.stringify(res.data.student));
        navigate("/dashboard");
      } else {
        setMessage(res.data.message || "Registracija nije uspjela.");
      }
    } catch {
      setMessage("Došlo je do pogreške prilikom registracije.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Registracija</h2>

        <input name="username" placeholder="Korisničko ime" className="w-full border rounded px-3 py-2 mb-3" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Lozinka" className="w-full border rounded px-3 py-2 mb-3" value={form.password} onChange={handleChange} required />
        <input name="name" placeholder="Puno ime" className="w-full border rounded px-3 py-2 mb-3" value={form.name} onChange={handleChange} required />
        <input name="university" placeholder="Fakultet" className="w-full border rounded px-3 py-2 mb-3" value={form.university} onChange={handleChange} required />
        <textarea name="about" placeholder="O sebi" className="w-full border rounded px-3 py-2 mb-3" rows="3" value={form.about} onChange={handleChange} />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Registriraj se</button>
        {message && <p className="text-red-600 text-sm mt-3">{message}</p>}
      </form>
    </div>
  );
}
