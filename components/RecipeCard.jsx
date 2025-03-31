export default function RecipeCard({ recipe, type }) {
  const handleUseRecipe = async () => {
    await fetch('/use-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: recipe.ingredients,
        type
      })
    });
    window.location.reload();
  };

  const getCuisineName = () => {
    switch(type) {
      case 'gujarati': return recipe.name.gujarati;
      case 'punjabi': return recipe.name.punjabi;
      default: return recipe.recipe_name;
    }
  };

  return (
    <div className={`recipe-card ${type}`}>
      <div className="card-header">
        <h3>
          <span className="english-name">{recipe.name.english || recipe.recipe_name}</span>
          <span className="regional-name">{getCuisineName()}</span>
          <span className={`cuisine-badge ${type}`}>
            {type.toUpperCase()}
          </span>
        </h3>
        {type !== 'manual' && (
          <div className="vegetarian-tag">🥕 Vegetarian</div>
        )}
      </div>

      <div className="ingredients-list">
        {recipe.ingredients.map((ing, index) => (
          <div key={index} className={`ingredient ${ing.available ? 'in-stock' : 'missing'}`}>
            <span>{ing.name}</span>
            <span>{ing.quantity}{ing.unit}</span>
            {!ing.available && <span className="missing-text">(missing)</span>}
          </div>
        ))}
      </div>

      <button className="use-recipe-btn" onClick={handleUseRecipe}>
        {type === 'manual' ? 'Cook Now' : 'Try This Regional Special'}
      </button>
    </div>
  );
}