import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "admin" || user?.role === "staff";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Transport App</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Trips</Link>
        {user && <Link to="/bookings">My Bookings</Link>}
        {isStaff && <Link to="/admin/trips">Manage Trips</Link>}
        {isStaff && <Link to="/admin/vehicles">Vehicles</Link>}
        {isStaff && <Link to="/admin/drivers">Drivers</Link>}
        {isStaff && <Link to="/admin/routes">Routes</Link>}
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <span className="navbar-username">
              {user.name} ({user.role})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
