
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import apiService from '../services/api';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleQuickGenerate = async () => {
    if (!ideaPrompt.trim()) {
      alert('Please enter an idea prompt');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to generate ideas');
      return;
    }

    setIsLoading(true);
    try {
      const categoryIds = selectedCategory ? [parseInt(selectedCategory)] : [];
      const result = await apiService.generateIdeas(ideaPrompt, categoryIds);
      
      // Show a simple success message and redirect to dashboard
      alert('Ideas generated successfully! Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Quick Idea Generator Section */}
      <div className="w3-container w3-padding-32 w3-light-grey">
        <h3 className="w3-center">Quick Idea Generator</h3>
        <p className="w3-center w3-text-grey">Try our AI idea generator right from the homepage!</p>
        
        <div className="w3-row-padding w3-center">
          <div className="w3-col m8 l6 w3-margin-auto">
            <div className="w3-container w3-white w3-padding-32 w3-card">
              <div className="w3-margin-bottom">
                <label className="w3-text-grey">What kind of ideas are you looking for?</label>
                <input
                  type="text"
                  className="w3-input w3-border w3-margin-top"
                  placeholder="e.g., innovative mobile app concepts, sustainable business ideas..."
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                />
              </div>
              
              <div className="w3-margin-bottom">
                <label className="w3-text-grey">Category (optional)</label>
                <select
                  className="w3-select w3-border w3-margin-top"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className={`w3-button w3-blue w3-large w3-block ${isLoading ? 'w3-disabled' : ''}`}
                onClick={handleQuickGenerate}
                disabled={isLoading}
              >
                {isLoading ? 'Generating Ideas...' : 'Generate Ideas'}
              </button>
              
              {!isAuthenticated && (
                <p className="w3-text-red w3-small w3-margin-top">
                  Please <Link to="/login" className="w3-text-blue">login</Link> to generate ideas
                </p>
              )}
            </div>
          </div>
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
