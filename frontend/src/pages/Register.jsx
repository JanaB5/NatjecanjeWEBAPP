import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    university: "",
    about: "",
    company_name: "",
    industry: "",
  });
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        role === "student"
          ? "http://127.0.0.1:8000/register"
          : "http://127.0.0.1:8000/register_company";

      const formData = new FormData(e.target);
      const res = await axios.post(endpoint, formData);

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
        setMessage(res.data.message || "Registracija nije uspjela.");
      }
    } catch {
      setMessage("Došlo je do pogreške prilikom registracije.");
    }
  };

  return (
    <div
      className="relative flex justify-center items-center min-h-screen overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80')", // 📘 soft academic background
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-700/30 to-blue-500/40 backdrop-blur-[2px]"
        animate={{ opacity: [0.7, 0.8, 0.7] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* Floating light blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 9 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 11 }}
      />

      {/* Registration card */}
      <motion.form
        onSubmit={handleRegister}
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-[90%] max-w-lg border border-blue-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center drop-shadow-sm">
          Registracija
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

        {/* Common fields */}
        <input
          name="username"
          placeholder="Korisničko ime"
          className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Student fields */}
        {role === "student" && (
          <>
            <input
              name="name"
              placeholder="Puno ime"
              className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="university"
              placeholder="Fakultet"
              className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={form.university}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* Company fields */}
        {role === "company" && (
          <>
            <input
              name="company_name"
              placeholder="Naziv tvrtke"
              className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={form.company_name}
              onChange={handleChange}
              required
            />
            <input
              name="industry"
              placeholder="Industrija (npr. IT, Marketing...)"
              className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={form.industry}
              onChange={handleChange}
              required
            />
          </>
        )}

        <textarea
          name="about"
          placeholder={role === "student" ? "O sebi" : "Opis tvrtke"}
          className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none"
          rows="3"
          value={form.about}
          onChange={handleChange}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
        >
          Registriraj se
        </motion.button>

        {message && (
          <motion.p
            className="text-red-600 text-sm mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
