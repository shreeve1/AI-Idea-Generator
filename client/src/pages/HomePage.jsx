
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="w3-container w3-padding-32">
      <h1 className="w3-border-bottom w3-border-light-grey w3-padding-16">Idea Tracker</h1>
      <p>Your AI-powered idea generation and management platform</p>

      <div className="w3-display-container w3-margin-bottom">
        <div className="w3-container w3-blue w3-padding-32 w3-center">
          <h2 className="w3-text-white">Generate Ideas with AI</h2>
          <p className="w3-text-white w3-large">
            Harness the power of artificial intelligence to generate creative ideas for your projects
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="w3-button w3-white w3-large">
              Go to Dashboard
            </Link>
          ) : (
            <div>
              <Link to="/register" className="w3-button w3-white w3-large w3-margin-right">
                Get Started
              </Link>
              <Link to="/login" className="w3-button w3-border w3-text-white w3-large">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="w3-container w3-padding-32" id="features">
        <h3 className="w3-border-bottom w3-border-light-grey w3-padding-16">Features</h3>
      </div>

      <div className="w3-row-padding">
        <div className="w3-col l3 m6 w3-margin-bottom">
          <div className="w3-card">
            <div className="w3-container w3-padding">
              <h3>AI Generation</h3>
              <p className="w3-opacity">
                Use advanced AI to generate creative ideas based on your prompts and categories.
              </p>
            </div>
          </div>
        </div>
        <div className="w3-col l3 m6 w3-margin-bottom">
          <div className="w3-card">
            <div className="w3-container w3-padding">
              <h3>Organization</h3>
              <p className="w3-opacity">
                Organize your ideas into categories and manage them efficiently in your dashboard.
              </p>
            </div>
          </div>
        </div>
        <div className="w3-col l3 m6 w3-margin-bottom">
          <div className="w3-card">
            <div className="w3-container w3-padding">
              <h3>Collaboration</h3>
              <p className="w3-opacity">
                Share and collaborate on ideas with your team members and track progress.
              </p>
            </div>
          </div>
        </div>
        <div className="w3-col l3 m6 w3-margin-bottom">
          <div className="w3-card">
            <div className="w3-container w3-padding">
              <h3>Security</h3>
              <p className="w3-opacity">
                Your ideas are secure with JWT authentication and encrypted data storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
