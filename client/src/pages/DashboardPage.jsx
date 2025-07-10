
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import useIdeasStore from '../hooks/useIdeasStore';
import CategorySelector from '../components/CategorySelector';

const DashboardPage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();
  const { 
    ideas, 
    generateIdeas, 
    isGenerating, 
    error, 
    clearError,
    addIdea,
    removeIdea
  } = useIdeasStore();
  
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      return;
    }

    try {
      // Pass selected categories to the AI generation
      await generateIdeas(prompt, selectedCategories);
      setShowResults(true);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    }
  };

  const handleAddManualIdea = () => {
    const title = prompt('Enter idea title:');
    const description = prompt('Enter idea description:');
    
    if (title && description) {
      addIdea({
        title,
        description,
        source: 'manual',
        categoryId: selectedCategories.length > 0 ? selectedCategories[0] : null,
      });
    }
  };

  const handleCategoryChange = (categoryIds) => {
    setSelectedCategories(categoryIds);
  };

  if (!isAuthenticated) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="text-center">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h1>Dashboard</h1>
            <p className="text-secondary">Welcome, {user?.name || user?.email}</p>
          </div>
          
          {error && (
            <div className="error-message mb-md">
              <p>{error}</p>
            </div>
          )}

          {/* Category Selection Section */}
          <div className="mb-lg">
            <CategorySelector
              selectedCategories={selectedCategories}
              onSelectionChange={handleCategoryChange}
              multiSelect={true}
              disabled={isGenerating}
              className="mb-md"
            />
          </div>

          {/* Idea Generation Section */}
          <div className="card mb-lg">
            <div className="card-content">
              <h3 className="text-accent mb-md">Generate New Ideas</h3>
              
              {selectedCategories.length > 0 && (
                <div className="success-message mb-md">
                  <p>
                    <strong>Selected Categories:</strong> Ideas will be generated within these contexts to provide more targeted suggestions.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleGenerateIdeas}>
                <div className="form-group">
                  <label className="form-label">Idea Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe what kind of ideas you're looking for..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows="4"
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="form-group">
                  <button 
                    className={`btn btn-primary btn-large mr-md ${isGenerating ? 'loading' : ''}`}
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                  >
                    {isGenerating ? 'Generating Ideas...' : 'Generate Ideas with AI'}
                  </button>
                  
                  <button 
                    className="btn btn-large" 
                    type="button"
                    onClick={handleAddManualIdea}
                    disabled={isGenerating}
                  >
                    Add Manual Idea
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Ideas Display Section */}
          <div className="card">
            <div className="card-content">
              <h3 className="text-accent mb-md">Your Ideas ({ideas.length})</h3>
              
              {ideas.length === 0 ? (
                <div className="text-center p-lg">
                  <p className="text-muted">No ideas yet. Generate some ideas using the form above!</p>
                </div>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {ideas.map((idea, index) => (
                    <div key={idea.id || index} className="card card-portfolio">
                      <div className="card-content">
                        <h4 className="card-title">{idea.title}</h4>
                        <p className="card-description">{idea.description}</p>
                        
                        {idea.source && (
                          <div className="caption text-accent mt-sm">
                            Source: {idea.source === 'ai' ? 'AI Generated' : 'Manual'}
                          </div>
                        )}
                        
                        {idea.categories_used && idea.categories_used.length > 0 && (
                          <div className="caption text-secondary mt-xs">
                            Categories: {idea.categories_used.join(', ')}
                          </div>
                        )}
                        
                        <button 
                          className="btn btn-primary mt-md"
                          onClick={() => removeIdea(idea.id)}
                        >
                          Remove Idea
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
