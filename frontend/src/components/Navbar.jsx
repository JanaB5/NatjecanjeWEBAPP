import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CareerApp
        </Link>
        <div className="flex space-x-2">
          <Link to="/about" className={linkClass("/about")}>O nama</Link>
          <Link to="/events" className={linkClass("/events")}>Događaji</Link>
          <Link to="/mentorships" className={linkClass("/mentorships")}>Mentorstva</Link>
          <Link to="/savjeti" className={linkClass("/savjeti")}>Savjeti</Link>
          <Link to="/karijere" className={linkClass("/karijere")}>Karijere</Link>
          <Link to="/connect" className={linkClass("/connect")}>Poveži se</Link>
        </div>
      </div>
    </nav>
  );
}
