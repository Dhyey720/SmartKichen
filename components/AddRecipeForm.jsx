import { useState } from 'react';

export default function AddRecipeForm() {
  const [formData, setFormData] = useState({
    name: '',
    cuisineType: 'Gujarati',
    category: 'Main',
    ingredients: [{ name: '', quantity: '', unit: 'g', optional: false }],
    vegetarian: true
  });

  const cuisineOptions = ['Gujarati', 'Punjabi', 'Other'];
  const categoryOptions = {
    Gujarati: ['Main', 'Snack', 'Sweet'],
    Punjabi: ['Main', 'Bread', 'Dessert'],
    Other: ['Breakfast', 'Lunch', 'Dinner']
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        name: '', 
        quantity: '', 
        unit: 'g', 
        optional: false 
      }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    alert('Recipe added successfully!');
    setFormData({
      name: '',
      cuisineType: 'Gujarati',
      category: 'Main',
      ingredients: [{ name: '', quantity: '', unit: 'g', optional: false }],
      vegetarian: true
    });
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Recipe Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Cuisine Type:</label>
          <select
            value={formData.cuisineType}
            onChange={e => setFormData({ 
              ...formData, 
              cuisineType: e.target.value,
              category: 'Main'
            })}
          >
            {cuisineOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {categoryOptions[formData.cuisineType].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ingredients-section">
        <h3>Ingredients</h3>
        {formData.ingredients.map((ing, index) => (
          <div key={index} className="ingredient-row">
            <input
              type="text"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={e => {
                const newIngredients = [...formData.ingredients];
                newIngredients[index].name = e.target.value;
                setFormData({ ...formData, ingredients: newIngredients });
              }}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={ing.quantity}
              onChange={e => {
                const newIngredients = [...formData.ingredients];
                newIngredients[index].quantity = e.target.value;
                setFormData({ ...formData, ingredients: newIngredients });
              }}
              required
            />
            <select
              value={ing.unit}
              onChange={e => {
                const newIngredients = [...formData.ingredients];
                newIngredients[index].unit = e.target.value;
                setFormData({ ...formData, ingredients: newIngredients });
              }}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="pieces">pieces</option>
            </select>
            <label className="optional-label">
              <input
                type="checkbox"
                checked={ing.optional}
                onChange={e => {
                  const newIngredients = [...formData.ingredients];
                  newIngredients[index].optional = e.target.checked;
                  setFormData({ ...formData, ingredients: newIngredients });
                }}
              />
              Optional
            </label>
            <button
              type="button"
              className="remove-btn"
              onClick={() => {
                const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                setFormData({ ...formData, ingredients: newIngredients });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="add-ingredient-btn">
          ＋ Add Ingredient
        </button>
      </div>

      <div className="vegetarian-toggle">
        <label>
          <input
            type="checkbox"
            checked={formData.vegetarian}
            onChange={e => setFormData({ ...formData, vegetarian: e.target.checked })}
          />
          🥕 Vegetarian Recipe
        </label>
      </div>

      <button type="submit" className="submit-btn">Save Regional Recipe</button>
    </form>
  );
}