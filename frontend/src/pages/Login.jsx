import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
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
          navigate("/company-dashboard");
        }
      } else {
        setError(res.data.message || "Korisnik nije pronađen.");
      }
    } catch {
      setError("Greška prilikom prijave.");
    }
  };

  return (
    <div
      className="relative flex justify-center items-center min-h-screen overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Soft gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-blue-900/40 backdrop-blur-[3px]"
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* Floating blobs for depth */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />

      {/* Login card */}
      <motion.form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-96 border border-blue-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center drop-shadow-sm">
          Prijava
        </h2>

        {/* Role selection */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`px-5 py-2 rounded-l-lg font-semibold transition-all ${
              role === "student"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`px-5 py-2 rounded-r-lg font-semibold transition-all ${
              role === "company"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Firma
          </button>
        </div>

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Korisničko ime"
          className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={form.username}
          onChange={handleChange}
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
        >
          Prijavi se
        </motion.button>

        {/* Error message */}
        {error && (
          <motion.p
            className="text-red-600 text-sm mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
