const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./Models');
const Recipe = require('./Models/Recipe');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

// -------------------------------
// GET ALL RECIPES
// -------------------------------
app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.findAll();
  res.json(recipes);
});

// -------------------------------
// ADD NEW RECIPE (with category)
// -------------------------------
app.post('/recipes', async (req, res) => {
  try {
    const recipe = await Recipe.create({
      title: req.body.title,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      imageUrl: req.body.imageUrl,
      createdBy: req.body.createdBy,
      category: req.body.category,   // ★ NEW FIELD
    });

    res.json(recipe);

  } catch (err) {
    console.error("Error creating recipe:", err);
    res.status(400).json({ error: "Invalid recipe data" });
  }
});

// -------------------------------
// LIKE A RECIPE
// -------------------------------
app.post("/recipes/:id/like", async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id);

  if (!recipe) return res.status(404).json({ error: "Recipe not found" });

  recipe.likes += 1;
  await recipe.save();

  res.json({ likes: recipe.likes });
});

// -------------------------------
// START SERVER
// -------------------------------
sequelize.sync().then(() => {
  console.log("Database synced!");
  app.listen(3000, () => 
    console.log("Server running on http://localhost:3000")
  );
});
