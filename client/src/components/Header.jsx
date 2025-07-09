
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w3-top">
      <div className="w3-bar w3-white w3-wide w3-padding w3-card">
        <Link to="/" className="w3-bar-item w3-button"><b>Idea</b> Tracker</Link>
        <div className="w3-right w3-hide-small">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="w3-bar-item w3-button">Dashboard</Link>
              <span className="w3-bar-item">Welcome, {user?.name || user?.email}</span>
              <button onClick={handleLogout} className="w3-bar-item w3-button w3-hover-red">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="w3-bar-item w3-button">Login</Link>
              <Link to="/register" className="w3-bar-item w3-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
