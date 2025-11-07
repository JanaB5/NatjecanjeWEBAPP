import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [role, setRole] = useState("student"); // 👈 Odabir uloge
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 👇 Dinamički endpoint ovisno o ulozi
      const endpoint =
        role === "student"
          ? "http://127.0.0.1:8000/login"
          : "http://127.0.0.1:8000/login_company";

      const res = await axios.post(endpoint, new FormData(e.target));

      if (res.data.success) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("role", role);

        if (role === "student") {
          localStorage.setItem("student", JSON.stringify(res.data.student));
          navigate("/dashboard");
        } else {
          localStorage.setItem("company", JSON.stringify(res.data.company));
          navigate("/company-dashboard"); // ✅ ispravno preusmjeravanje
        }
      } else {
        setError(res.data.message || "Korisnik nije pronađen.");
      }
    } catch {
      setError("Greška prilikom prijave.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Prijava</h2>

        {/* 👇 Odabir tipa korisnika */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`px-4 py-2 rounded-l border ${
              role === "student"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`px-4 py-2 rounded-r border ${
              role === "company"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            Firma
          </button>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Korisničko ime"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Prijavi se
        </button>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </form>
    </div>
  );
}
