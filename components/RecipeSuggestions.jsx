import { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';

export default function RecipeSuggestions({ inventory }) {
  const [suggestions, setSuggestions] = useState({ 
    gujarati: [], 
    punjabi: [], 
    manual: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/combined-suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setLoading(false);
      });
  }, [inventory]);

  const handleGenerateAI = async () => {
    setLoading(true);
    const response = await fetch('/generate-ai-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        inventory,
        cuisine: ['gujarati', 'punjabi'],
        dietary: ['vegetarian']
      })
    });
    const data = await response.json();
    setSuggestions(prev => ({
      ...prev,
      gujarati: data.gujarati,
      punjabi: data.punjabi
    }));
    setLoading(false);
  };

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        <h1>Regional Recipe Suggestions</h1>
        <button onClick={handleGenerateAI} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Regional Suggestions'}
        </button>
      </div>

      <div className="suggestions-grid">
        <div className="region-column">
          <h2>🍽️ Gujarati Specials ({suggestions.gujarati.length})</h2>
          {suggestions.gujarati.map(recipe => (
            <RecipeCard 
              key={recipe.name.english} 
              recipe={recipe} 
              type="gujarati" 
            />
          ))}
        </div>

        <div className="region-column">
          <h2>🧺 Punjabi Specials ({suggestions.punjabi.length})</h2>
          {suggestions.punjabi.map(recipe => (
            <RecipeCard 
              key={recipe.name.english} 
              recipe={recipe} 
              type="punjabi" 
            />
          ))}
        </div>

        <div className="manual-recipes-column">
          <h2>📖 Your Recipes ({suggestions.manual.length})</h2>
          {suggestions.manual.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} type="manual" />
          ))}
        </div>
      </div>
    </div>
  );
}