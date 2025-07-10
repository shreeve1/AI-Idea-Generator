
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="page-content">
      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr min(500px, 100%) 1fr' }}>
            <div></div>
            <div className="auth-form-container">
              <div className="text-center mb-lg">
                <h1>Welcome Back</h1>
                <p className="text-secondary">Sign in to your account</p>
              </div>
              
              {error && (
                <div className="error-message mb-md">
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    placeholder="Enter your password" 
                    required 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <button 
                    className={`btn btn-primary btn-block btn-large ${isLoading ? 'loading' : ''}`}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>
              
              <div className="auth-links">
                <div className="text-center mb-md">
                  <Link to="/request-password-reset" className="text-accent">
                    Forgot Password?
                  </Link>
                </div>
                
                <div className="text-center">
                  <span className="text-secondary">Don't have an account? </span>
                  <Link to="/register" className="text-accent">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
