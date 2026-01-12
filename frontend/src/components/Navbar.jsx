import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container flex flex-between">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span>🧠</span>
          <span>QuizMaster</span>
        </Link>
        
        <button 
          className="menu-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/quizzes" className={`nav-link ${isActive('/quizzes')}`} onClick={closeMenu}>
              All Quizzes
            </Link>
          </li>

          <li>
            <Link to="/random" className={`nav-link ${isActive('/random')}`} onClick={closeMenu}>
              Random Quiz
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <li>
                  <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`} onClick={closeMenu}>
                    Admin Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`} onClick={closeMenu}>
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={closeMenu}>
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm mobile-full">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn btn-secondary btn-sm mobile-full" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm mobile-full" onClick={closeMenu}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      
      {/* Mobile Overlay */}
      <div 
        className={`nav-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>
    </nav>
  );
}
