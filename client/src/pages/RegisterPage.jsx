
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();
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
    
    if (!formData.name || !formData.email || !formData.password) {
      return;
    }

    try {
      await register(formData);
      setSuccessMessage('Registration successful! Please check your email for verification.');
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      // Error is handled by the store
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="w3-container w3-padding-32">
      <h3 className="w3-border-bottom w3-border-light-grey w3-padding-16">Register</h3>
      
      {error && (
        <div className="w3-panel w3-red w3-round">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="w3-panel w3-green w3-round">
          <p>{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <p>
          <input 
            className="w3-input w3-border" 
            type="text" 
            placeholder="Name" 
            required 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </p>
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
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
