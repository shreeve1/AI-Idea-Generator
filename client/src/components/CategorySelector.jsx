import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const CategorySelector = ({ 
  selectedCategories = [], 
  onSelectionChange, 
  multiSelect = true,
  disabled = false,
  className = ""
}) => {
  console.log('🎯 CategorySelector: Component is rendering with props:', { 
    selectedCategories, 
    multiSelect, 
    disabled 
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    console.log('🔄 CategorySelector: Starting to fetch categories...');
    try {
      setLoading(true);
      setError(null);
      console.log('🌐 CategorySelector: Making API call to getCategories()');
      const data = await apiService.getCategories();
      console.log('✅ CategorySelector: Successfully fetched categories:', data);
      setCategories(data);
    } catch (error) {
      console.error('❌ CategorySelector: Failed to fetch categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      console.log('🏁 CategorySelector: Finished loading, setting loading to false');
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    if (disabled) return;

    let newSelection;
    
    if (multiSelect) {
      // Multi-select: toggle category in/out of selection
      newSelection = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
    } else {
      // Single select: replace selection or clear if same category clicked
      newSelection = selectedCategories.includes(categoryId) ? [] : [categoryId];
    }
    
    onSelectionChange?.(newSelection);
  };

  const clearSelection = () => {
    if (disabled) return;
    onSelectionChange?.([]);
  };

  if (loading) {
    return (
      <div className={`category-selector ${className}`}>
        <div className="category-selector-content loading">
          <div className="text-center">
            <div className="caption text-muted">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`category-selector ${className}`}>
        <div className="category-selector-content">
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchCategories}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-selector ${className}`}>
      <div className="category-selector-header">
        <h4 className="category-selector-title">
          Categories {multiSelect && `(${selectedCategories.length} selected)`}
        </h4>
        {selectedCategories.length > 0 && (
          <button 
            className="btn btn-primary"
            onClick={clearSelection}
            disabled={disabled}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="category-grid">
        {categories.map(category => {
          console.log('🎨 CategorySelector: Rendering category:', category);
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <div 
              key={category.id} 
              className={`category-item ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleCategoryToggle(category.id)}
            >
              <div className="category-icon">
                {getCategoryIcon(category.name)}
              </div>
              <div className="category-name">
                {category.name}
              </div>
              {isSelected && (
                <div className="category-check">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center p-md">
          <p className="text-muted">No categories available.</p>
        </div>
      )}

      <div className="category-selector-footer">
        <p className="caption text-muted">
          {multiSelect 
            ? 'Click categories to select multiple. Selected categories will influence AI idea generation.'
            : 'Click a category to select it. Click again to deselect.'
          }
        </p>
      </div>
    </div>
  );
};

// Helper function to get category icons
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Technology': '💻',
    'Business': '💼',
    'Education': '📚',
    'Health & Fitness': '🏥',
    'Environment': '🌱',
    'Social': '👥',
    'Entertainment': '🎮',
    'Travel': '✈️',
    'Food & Beverage': '🍕',
    'Finance': '💰',
    'Other': '💡'
  };
  
  return iconMap[categoryName] || '📁';
};

export default CategorySelector; 