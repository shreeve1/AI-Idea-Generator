
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts or when form data changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  // Validate password requirements in real-time
  useEffect(() => {
    const password = formData.password;
    setPasswordRequirements({
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[@$!%*?&])/.test(password)
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  return (
    <div className="page-content">
      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr min(500px, 100%) 1fr' }}>
            <div></div>
            <div className="auth-form-container">
              <div className="text-center mb-lg">
                <h1>Create Account</h1>
                <p className="text-secondary">Join the platform for AI-powered idea generation</p>
              </div>
              
              {error && (
                <div className="error-message mb-md">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className="form-input"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  
                  {/* Password Requirements */}
                  <div className="password-requirements mt-sm">
                    <div className="caption text-muted mb-xs">Password Requirements:</div>
                    <div className="requirements-list">
                      <div className={`requirement ${passwordRequirements.length ? 'met' : 'unmet'}`}>
                        <span className="requirement-icon">
                          {passwordRequirements.length ? "✓" : "○"}
                        </span>
                        <span className="requirement-text">At least 8 characters</span>
                      </div>
                      <div className={`requirement ${passwordRequirements.lowercase ? 'met' : 'unmet'}`}>
                        <span className="requirement-icon">
                          {passwordRequirements.lowercase ? "✓" : "○"}
                        </span>
                        <span className="requirement-text">One lowercase letter</span>
                      </div>
                      <div className={`requirement ${passwordRequirements.uppercase ? 'met' : 'unmet'}`}>
                        <span className="requirement-icon">
                          {passwordRequirements.uppercase ? "✓" : "○"}
                        </span>
                        <span className="requirement-text">One uppercase letter</span>
                      </div>
                      <div className={`requirement ${passwordRequirements.number ? 'met' : 'unmet'}`}>
                        <span className="requirement-icon">
                          {passwordRequirements.number ? "✓" : "○"}
                        </span>
                        <span className="requirement-text">One number</span>
                      </div>
                      <div className={`requirement ${passwordRequirements.special ? 'met' : 'unmet'}`}>
                        <span className="requirement-icon">
                          {passwordRequirements.special ? "✓" : "○"}
                        </span>
                        <span className="requirement-text">One special character (@$!%*?&)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className={`btn btn-primary btn-block btn-large ${isLoading || !allRequirementsMet ? 'loading' : ''}`}
                    disabled={isLoading || !allRequirementsMet}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="auth-links">
                <div className="text-center">
                  <span className="text-secondary">Already have an account? </span>
                  <Link to="/login" className="text-accent">
                    Sign In
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

export default RegisterPage;
