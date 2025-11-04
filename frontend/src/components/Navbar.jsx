import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
    }`;

  const student = JSON.parse(localStorage.getItem("student"));

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CareerApp
        </Link>
        <div className="flex space-x-2">
          <Link to="/about" className={linkClass("/about")}>O nama</Link>
          <Link to="/savjeti" className={linkClass("/savjeti")}>Savjeti</Link>
          <Link to="/events" className={linkClass("/events")}>Događaji</Link>
          <Link to="/karijere" className={linkClass("/karijere")}>Karijere</Link>
          <Link to="/mentorships" className={linkClass("/mentorships")}>Mentorstva</Link>
          <Link to="/connect" className={linkClass("/connect")}>Poveži se</Link>
          {/* 🔹 Login button */}
          {!student && (
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

          {student && (
            <Link
              to="/dashboard"
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
