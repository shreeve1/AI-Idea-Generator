
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w3-container w3-padding-32">
      <h3 className="w3-border-bottom w3-border-light-grey w3-padding-16">Login</h3>
      
      {error && (
        <div className="w3-panel w3-red w3-round">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <p>
          <input 
            className="w3-input w3-border" 
            type="email" 
            placeholder="Email" 
            required 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </p>
        <p>
          <input 
            className="w3-input w3-border" 
            type="password" 
            placeholder="Password" 
            required 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </p>
        <p>
          <button 
            className="w3-button w3-black" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
