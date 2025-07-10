
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
    });
    const location = useLocation();

    // Validate password requirements in real-time
    useEffect(() => {
        setPasswordRequirements({
            length: password.length >= 8,
            lowercase: /(?=.*[a-z])/.test(password),
            uppercase: /(?=.*[A-Z])/.test(password),
            number: /(?=.*\d)/.test(password),
            special: /(?=.*[@$!%*?&])/.test(password)
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
        if (!allRequirementsMet) {
            setError('Password does not meet all requirements');
            return;
        }

        const token = new URLSearchParams(location.search).get('token');
        if (!token) {
            setError('Reset token is missing or invalid');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/reset-password', { token, password });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
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
                                <h1>Reset Password</h1>
                                <p className="text-secondary">Enter your new password below</p>
                            </div>
                            
                            {message && (
                                <div className="success-message mb-md">
                                    <p>{message}</p>
                                    <div className="text-center mt-md">
                                        <Link to="/login" className="btn btn-primary">
                                            Go to Login
                                        </Link>
                                    </div>
                                </div>
                            )}
                            
                            {error && (
                                <div className="error-message mb-md">
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            {!message && (
                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            className="form-input"
                                            type="password"
                                            placeholder="Enter your new password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
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
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            className="form-input"
                                            type="password"
                                            placeholder="Confirm your new password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <button 
                                            className={`btn btn-primary btn-block btn-large ${isLoading ? 'loading' : ''}`}
                                            type="submit"
                                            disabled={isLoading || !allRequirementsMet || password !== confirmPassword}
                                        >
                                            {isLoading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                            
                            <div className="auth-links">
                                <div className="text-center">
                                    <Link to="/login" className="text-accent">
                                        Back to Login
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

export default ResetPasswordPage;
