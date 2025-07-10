
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/request-password-reset', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setIsLoading(false);
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
                                <h1>Reset Password</h1>
                                <p className="text-secondary">Enter your email address and we'll send you a link to reset your password</p>
                            </div>
                            
                            {message && (
                                <div className="success-message mb-md">
                                    <p>{message}</p>
                                </div>
                            )}
                            
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
                                        placeholder="Enter your email address"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <button 
                                        className={`btn btn-primary btn-block btn-large ${isLoading ? 'loading' : ''}`}
                                        type="submit"
                                        disabled={isLoading || !email.trim()}
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>
                            </form>
                            
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

export default RequestPasswordResetPage;
