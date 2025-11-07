import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AddJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);

    try {
      await api.post("/company/add_job", formData);
      alert("Oglas uspješno objavljen!");
      navigate("/dashboard");
    } catch {
      alert("Greška pri objavi oglasa.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Objavi novi posao</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Naziv posla"
          className="w-full p-2 mb-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Opis posla"
          className="w-full p-2 mb-3 border rounded"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          type="text"
          placeholder="Lokacija"
          className="w-full p-2 mb-3 border rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white py-2 w-full rounded">
          Objavi oglas
        </button>
      </form>
    </div>
  );
}
