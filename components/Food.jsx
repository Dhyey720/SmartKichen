import React, { useState, useRef, useEffect } from 'react';
import './Food.css'; // We'll create this CSS file

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');

  const handleSubmit = () => {
    const recipeData = { ingredients, mealType, cuisine, cookingTime, complexity };
    onSubmit(recipeData);
  };

  return (
    <>
      <h1 className='ai'>AI-Driven Recipe Recommendations</h1>
    <section className='food'>
    <div className="recipe-card">
      <div className="recipe-card-title">Recipe Generator</div>
      
      <div className="form-group">
        <label htmlFor="ingredients">Ingredients</label>
        <input
          id="ingredients"
          type="text"
          placeholder="Enter ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          />
      </div>

      <div className="form-group">
        <label htmlFor="mealType">Meal Type</label>
        <select
          id="mealType"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          >
          <option value="">Select</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="cuisine">Cuisine Preference</label>
        <input
          id="cuisine"
          type="text"
          placeholder="e.g., Italian, Mexican"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          />
      </div>

      <div className="form-group">
        <label htmlFor="cookingTime">Cooking Time</label>
        <select
          id="cookingTime"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
          >
          <option value="">Select</option>
          <option value="Less than 30 minutes">Less than 30 minutes</option>
          <option value="30-60 minutes">30-60 minutes</option>
          <option value="More than 1 hour">More than 1 hour</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="complexity">Complexity</label>
        <select
          id="complexity"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          >
          <option value="">Select</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <button
        className="submit-button"
        type="button"
        onClick={handleSubmit}
        >
        Generate Recipe
      </button>
    </div>
  </section>
</>
  );
};

const Food = () => {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!recipeData) return;

    const initializeEventStream = () => {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(recipeData).toString();
      const url = `http://localhost:5001/recipeStream?${queryParams}`;
      
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === "close") {
            setIsLoading(false);
            closeEventStream();
          } else if (data.action === "chunk") {
            setRecipeText(prev => prev + data.chunk);
          }
        } catch (err) {
          setError("Error parsing recipe data");
          setIsLoading(false);
          closeEventStream();
        }
      };

      eventSourceRef.current.onerror = () => {
        setError("Connection error. Please try again.");
        setIsLoading(false);
        closeEventStream();
      };
    };

    initializeEventStream();
  }, [recipeData]);

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const onSubmit = (data) => {
    if (!data.ingredients) {
      setError("Please enter at least one ingredient");
      return;
    }
    setRecipeText('');
    setRecipeData(data);
  };

  return (
    <div className="food-app">
      <RecipeCard onSubmit={onSubmit} />
      <div className="recipe-output">
        {isLoading && !recipeText && (
          <div className="loading">Generating recipe...</div>
        )}
        {error && <div className="error">{error}</div>}
        {recipeText}
      </div>
    </div>
  );
};

export default Food;