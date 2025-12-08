const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./Models/index');
const Recipe = require('./Models/Recipe');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

// GET ALL RECIPES
app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.findAll();
  res.json(recipes);
});

// ADD NEW RECIPE
app.post('/recipes', async (req, res) => {
  const recipe = await Recipe.create(req.body);
  res.json(recipe);
});

// Sync DB + Start Server
sequelize.sync().then(() => {
  console.log("Database synced!");
  app.listen(3000, () => console.log("Server running on http://localhost:3000"));
});

//LIKES 
app.post("/recipes/:id/like", async (req, res) => {
    const recipe = await Recipe.findByPk(req.params.id);

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    recipe.likes += 1;
    await recipe.save();

    res.json({ likes: recipe.likes });
});

