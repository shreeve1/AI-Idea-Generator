
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import apiService from '../services/api';
import CategorySelector from '../components/CategorySelector';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const handleQuickGenerate = async () => {
    console.log('🚀 HomePage: Starting idea generation...');
    console.log('📝 HomePage: Prompt:', ideaPrompt);
    console.log('🏷️ HomePage: Selected categories:', selectedCategories);
    
    if (!ideaPrompt.trim()) {
      console.log('❌ HomePage: No prompt provided');
      setError('Please enter an idea prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isAuthenticated) {
        console.log('🔐 HomePage: Using authenticated endpoint');
        result = await apiService.generateIdeas(ideaPrompt, selectedCategories);
        alert('Ideas generated successfully! Redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
      } else {
        console.log('👤 HomePage: Using guest endpoint');
        result = await apiService.generateIdeasGuest(ideaPrompt, selectedCategories);
        console.log('✅ HomePage: API response received:', result);
      }
      
      const ideas = result.data?.ideas || result.ideas || [];
      console.log('💡 HomePage: Parsed ideas:', ideas);
      
      setGeneratedIdeas(ideas);
      setShowResults(true);
      setIdeaPrompt('');
      
    } catch (error) {
      console.error('❌ HomePage: Failed to generate ideas:', error);
      setError(error.message || 'Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryIds) => {
    setSelectedCategories(categoryIds);
  };

  const handleTryAgain = () => {
    setShowResults(false);
    setGeneratedIdeas([]);
    setError(null);
  };

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="grid">
            <div className="hero-content fade-in-up">
              <h1>AI-Powered Idea Generation</h1>
              <p className="mb-lg">
                Harness the power of artificial intelligence to generate creative ideas for your projects. 
                Transform your concepts into architectural blueprints for success.
              </p>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Access Dashboard
                </Link>
              ) : (
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-large">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-large">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Idea Generator Section */}
      <section className="section surface">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>
              {isAuthenticated ? 'Quick Idea Generator' : 'Experience AI Innovation'}
            </h2>
            <p className="text-secondary">
              {isAuthenticated 
                ? 'Generate ideas that will be automatically saved to your dashboard' 
                : 'Discover what our AI can create for you - sign up to save and manage your ideas'
              }
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr min(800px, 100%) 1fr' }}>
            <div></div>
            <div className="generator-container">
              {error && (
                <div className="error-message mb-md">
                  <p>{error}</p>
                </div>
              )}

              {!showResults ? (
                <div className="card">
                  <div className="card-content">
                    {/* Category Selection */}
                    <div className="form-group">
                      <label className="form-label">Select Categories</label>
                      <CategorySelector
                        selectedCategories={selectedCategories}
                        onSelectionChange={handleCategoryChange}
                        multiSelect={true}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Prompt Input */}
                    <div className="form-group">
                      <label className="form-label">Describe Your Vision</label>
                      <textarea
                        className="form-textarea"
                        placeholder="e.g., innovative mobile app concepts, sustainable business ideas, creative writing prompts..."
                        value={ideaPrompt}
                        onChange={(e) => setIdeaPrompt(e.target.value)}
                        rows="4"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <button
                      className={`btn btn-primary btn-block btn-large ${isLoading ? 'loading' : ''}`}
                      onClick={handleQuickGenerate}
                      disabled={isLoading || !ideaPrompt.trim()}
                    >
                      {isLoading ? 'Generating Ideas...' : 'Generate Ideas with AI'}
                    </button>
                    
                    {!isAuthenticated && (
                      <div className="success-message mt-md">
                        <p className="caption">
                          <strong>Guest Mode Active:</strong> Ideas will be displayed but not saved. 
                          <Link to="/register" className="text-accent"> Create an account</Link> to save and manage your ideas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Results Display */
                <div className="results-container">
                  <div className="text-center mb-lg">
                    <h3>Generated Ideas</h3>
                    <p className="text-secondary">AI-crafted concepts tailored to your vision</p>
                  </div>
                  
                  {generatedIdeas.length > 0 ? (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                      {generatedIdeas.map((idea, index) => (
                        <div key={index} className="card card-portfolio">
                          <div className="card-content">
                            <h4 className="card-title text-accent">{idea.title}</h4>
                            <p className="card-description">{idea.description}</p>
                            {idea.categories_used && idea.categories_used.length > 0 && (
                              <div className="mt-sm">
                                <div className="caption text-muted">
                                  Categories: {idea.categories_used.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted">No ideas were generated. Please try again.</p>
                    </div>
                  )}

                  <div className="text-center mt-lg">
                    <button 
                      className="btn btn-primary"
                      onClick={handleTryAgain}
                    >
                      Generate More Ideas
                    </button>
                    
                    {!isAuthenticated && (
                      <Link to="/register" className="btn ml-md">
                        Sign Up to Save Ideas
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Platform Features</h2>
            <p className="text-secondary">Comprehensive tools for idea generation and management</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="card mb-md">
              <div className="card-content">
                <h4 className="text-accent">AI Generation</h4>
                <p className="card-description">
                  Advanced artificial intelligence generates creative ideas based on your prompts and selected categories.
                </p>
              </div>
            </div>
            
            <div className="card mb-md">
              <div className="card-content">
                <h4 className="text-accent">Smart Organization</h4>
                <p className="card-description">
                  Organize and categorize your ideas efficiently with our intelligent dashboard management system.
                </p>
              </div>
            </div>
            
            <div className="card mb-md">
              <div className="card-content">
                <h4 className="text-accent">Collaboration</h4>
                <p className="card-description">
                  Share and collaborate on ideas with team members while tracking progress and iterations.
                </p>
              </div>
            </div>
            
            <div className="card mb-md">
              <div className="card-content">
                <h4 className="text-accent">Enterprise Security</h4>
                <p className="card-description">
                  Your ideas are protected with JWT authentication and enterprise-grade encrypted data storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
