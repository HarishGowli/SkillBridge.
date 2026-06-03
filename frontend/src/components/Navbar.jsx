import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const profilePath = user?.role === 'NGO' ? '/dashboard/ngo' : '/profile';
  
  // Use organizationName for NGOs, fullName for volunteers
  const welcomeName = user?.organizationName || user?.fullName || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <Link to="/" className="logo">
        <span className="logo-icon">SB</span>
        <span className="logo-text">SkillBridge</span>
      </Link>
      <nav className="nav-links">
        <Link to="/opportunities" className="nav-item">
          Opportunities
        </Link>
        <Link to="/about" className="nav-item">
          About
        </Link>
        <Link to="/contact" className="nav-item">
          Contact
        </Link>
        {user && user.role === "NGO" && (
          <Link to="/dashboard/ngo" className="nav-item">
            Dashboard
          </Link>
        )}
        {user && user.role === "VOLUNTEER" && (
          <Link to="/dashboard/volunteer" className="nav-item">
            Dashboard
          </Link>
        )}
      </nav>
      <div className="auth-buttons">
        {user ? (
          <>
            <span className="nav-item">Welcome, {welcomeName}</span>
            <Link to='/profile' className="nav-item nav-get-started">
              Profile
            </Link>
            <button onClick={handleLogout} className="nav-item nav-logout">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item nav-login">
              Log In
            </Link>
            <Link to="/register" className="nav-item nav-get-started">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
