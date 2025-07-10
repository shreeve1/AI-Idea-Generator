
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <b>Idea</b> Tracker
        </Link>
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-item">
                Dashboard
              </Link>
              <span className="nav-item text-secondary">
                Welcome, {user?.name || user?.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
