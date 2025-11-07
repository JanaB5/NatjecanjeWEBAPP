import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [student, setStudent] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const studentData = JSON.parse(localStorage.getItem("student"));
    const companyData = JSON.parse(localStorage.getItem("company"));

    setIsLoggedIn(!!token);
    setRole(userRole);
    setStudent(studentData);
    setCompany(companyData);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("student");
    localStorage.removeItem("company");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
    }`;

  // 🔹 Odredi dashboard rutu prema ulozi
  const dashboardPath =
    role === "company" ? "/company-dashboard" : "/dashboard";

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CareerApp
        </Link>

        <div className="flex space-x-2">
          {/* 🔹 Ako je prijavljena firma — vidi samo O nama, Pretraži studente i Dashboard */}
          {isLoggedIn && role === "company" ? (
            <>
              <Link to="/about" className={linkClass("/about")}>
                O nama
              </Link>
              <Link to="/search-students" className={linkClass("/search-students")}>
                Pretraži studente
              </Link>
              <Link
                to={dashboardPath}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              {/* 🔹 Originalni linkovi za studente */}
              <Link to="/about" className={linkClass("/about")}>
                O nama
              </Link>
              <Link to="/savjeti" className={linkClass("/savjeti")}>
                Savjeti
              </Link>
              <Link to="/events" className={linkClass("/events")}>
                Događaji
              </Link>
              <Link to="/karijere" className={linkClass("/karijere")}>
                Karijere
              </Link>
              
              <Link to="/connect" className={linkClass("/connect")}>
                Poveži se
              </Link>

              {!isLoggedIn && (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Prijava
                  </Link>
                  <Link
                    to="/register"
                    className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Registracija
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  <Link
                    to={dashboardPath}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white"
                  >
                    Odjava
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
