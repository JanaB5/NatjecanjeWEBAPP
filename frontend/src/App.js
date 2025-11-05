import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Savjeti from "./pages/Savjeti";
import Karijere from "./pages/Karijere";
import Events from "./pages/Events";
import Mentorships from "./pages/Mentorships";
import About from "./pages/About";
import Connect from "./pages/Connect";
import AIFloatingChat from "./components/AIFloatingChat";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/savjeti" element={<Savjeti />} />
            <Route path="/karijere" element={<Karijere />} />
            <Route path="/events" element={<Events />} />
            <Route path="/mentorships" element={<Mentorships />} />
            <Route path="/about" element={<About />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
        <AIFloatingChat />
      </div>
    </Router>
  );
}

export default App;
