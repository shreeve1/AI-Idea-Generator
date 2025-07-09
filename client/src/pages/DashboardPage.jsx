
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import useIdeasStore from '../hooks/useIdeasStore';

const DashboardPage = () => {
  const [prompt, setPrompt] = useState('');
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
      await generateIdeas(prompt);
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
        categoryId: null,
      });
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w3-container w3-padding-32">
      <h3 className="w3-border-bottom w3-border-light-grey w3-padding-16">
        Dashboard - Welcome, {user?.name || user?.email}
      </h3>
      
      {error && (
        <div className="w3-panel w3-red w3-round">
          <p>{error}</p>
        </div>
      )}

      {/* Idea Generation Section */}
      <div className="w3-card w3-margin-bottom">
        <div className="w3-container w3-padding">
          <h4>Generate New Ideas</h4>
          <form onSubmit={handleGenerateIdeas}>
            <p>
              <textarea
                className="w3-input w3-border"
                placeholder="Describe what kind of ideas you're looking for..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="3"
                disabled={isGenerating}
              />
            </p>
            <p>
              <button 
                className="w3-button w3-blue w3-margin-right" 
                type="submit"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? 'Generating Ideas...' : 'Generate Ideas with AI'}
              </button>
              <button 
                className="w3-button w3-green" 
                type="button"
                onClick={handleAddManualIdea}
              >
                Add Manual Idea
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Ideas Display Section */}
      <div className="w3-card">
        <div className="w3-container w3-padding">
          <h4>Your Ideas ({ideas.length})</h4>
          
          {ideas.length === 0 ? (
            <p className="w3-text-grey">No ideas yet. Generate some ideas using the form above!</p>
          ) : (
            <div className="w3-row-padding">
              {ideas.map((idea, index) => (
                <div key={idea.id || index} className="w3-col l4 m6 s12 w3-margin-bottom">
                  <div className="w3-card-4">
                    <div className="w3-container w3-padding">
                      <h5>{idea.title}</h5>
                      <p className="w3-text-grey">{idea.description}</p>
                      {idea.source && (
                        <p className="w3-small w3-text-blue">
                          Source: {idea.source === 'ai' ? 'AI Generated' : 'Manual'}
                        </p>
                      )}
                      <button 
                        className="w3-button w3-red w3-small"
                        onClick={() => removeIdea(idea.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
