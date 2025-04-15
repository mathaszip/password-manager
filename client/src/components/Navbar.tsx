import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SecurePass
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/testimonials" className={isActive("/testimonials")}>
              Testimonials
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className={isActive("/dashboard")}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <div className="user-info">
                  <span>{user?.email}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className={isActive("/login")}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className={isActive("/register")}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
