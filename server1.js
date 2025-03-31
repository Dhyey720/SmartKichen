require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ready',
    services: {
      primary: process.env.OPENAI_API_KEY ? 'active' : 'inactive',
      fallback: 'active'
    }
  });
});

// Mock Data Fallback
const mockRecipes = {
  'chicken,rice': `🍴 Chicken Rice Bowl\n📝 Simple balanced meal\n🛒 Ingredients:\n- Chicken (200g)\n- Rice (1 cup)\n🔪 Instructions:\n1. Cook rice\n2. Grill chicken\n⏱️ Time: 30 mins\n⭐ Easy`,
  'eggs,tomatoes': `🍴 Scrambled Eggs\n📝 Classic breakfast\n🛒 Ingredients:\n- Eggs (3)\n- Tomatoes (2)\n🔪 Instructions:\n1. Whisk eggs\n2. Cook with tomatoes\n⏱️ Time: 10 mins\n⭐ Beginner`
};

// Recipe Generation Endpoint
app.post('/generate-recipe', async (req, res) => {
  const { ingredients } = req.body;
  
  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  try {
    // Try OpenAI first
    let recipe = await generateWithOpenAI(ingredients);
    
    // If OpenAI fails, try HuggingFace
    if (!recipe) {
      recipe = await generateWithHuggingFace(ingredients);
    }
    
    // If all APIs fail, use mock data
    if (!recipe) {
      const key = ingredients.toLowerCase().replace(/\s+/g, '');
      recipe = mockRecipes[key] || generateGenericRecipe(ingredients);
    }

    res.json({ recipe });
    
  } catch (error) {
    console.error("Generation error:", error);
    const key = ingredients.toLowerCase().replace(/\s+/g, '');
    res.json({ 
      recipe: mockRecipes[key] || generateGenericRecipe(ingredients),
      warning: "Used fallback recipe due to API issues"
    });
  }
});

// AI Service Functions
async function generateWithOpenAI(ingredients) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "Generate recipes with this format:\n🍴 [Name]\n📝 [Description]\n🛒 Ingredients:\n- [Item1]\n- [Item2]\n🔪 Instructions:\n1. Step 1\n2. Step 2\n⏱️ Time: \n⭐ Difficulty:"
        }, {
          role: "user",
          content: `Create recipe using: ${ingredients}`
        }],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    return response.data.choices[0].message.content;
  } catch {
    return null;
  }
}

async function generateWithHuggingFace(ingredients) {
  if (!process.env.HF_TOKEN) return null;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        inputs: `Generate recipe using ${ingredients} in format:\nName:\nIngredients:\nInstructions:`
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );
    
    return response.data.generated_text;
  } catch {
    return null;
  }
}

function generateGenericRecipe(ingredients) {
  return `🍴 Custom Creation\n📝 Made with love using ${ingredients}\n🛒 Ingredients:\n- ${ingredients.split(',').join('\n- ')}\n🔪 Instructions:\n1. Clean all ingredients\n2. Combine creatively\n3. Cook until delicious!\n⏱️ Time: 30 mins\n⭐ Moderate`;
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Endpoints:
  - POST /generate-recipe
  - GET /health
  `);
});