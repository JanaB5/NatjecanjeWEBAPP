import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole);
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
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      pathname === path
        ? "text-blue-700 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  const dashboardPath =
    role === "company" ? "/company-dashboard" : "/dashboard";

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 tracking-tight hover:opacity-90 transition"
        >
          Kari<span className="text-blue-500">Link</span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-3">
          {isLoggedIn && role === "company" ? (
            <>
              <Link to="/about" className={linkClass("/about")}>
                O nama
                {pathname === "/about" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link
                to="/search-students"
                className={linkClass("/search-students")}
              >
                Pretraži studente
                {pathname === "/search-students" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link
                to={dashboardPath}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:shadow-md hover:scale-[1.02] transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="border border-red-600 text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 hover:text-white transition"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link to="/about" className={linkClass("/about")}>
                O nama
                {pathname === "/about" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link to="/savjeti" className={linkClass("/savjeti")}>
                Savjeti
                {pathname === "/savjeti" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link to="/events" className={linkClass("/events")}>
                Događaji
                {pathname === "/events" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link to="/karijere" className={linkClass("/karijere")}>
                Karijere
                {pathname === "/karijere" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              <Link to="/connect" className={linkClass("/connect")}>
                Poveži se
                {pathname === "/connect" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:shadow-md hover:scale-[1.02] transition"
                  >
                    Prijava
                  </Link>
                  <Link
                    to="/register"
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition"
                  >
                    Registracija
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={dashboardPath}
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 hover:text-white transition"
                  >
                    Odjava
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
