const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const { sequelize } = require("./Models");
const Recipe = require("./Models/Recipe");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "Public")));

// --------------------------------------------------
// ROUTES FOR HTML PAGES
// --------------------------------------------------

// Landing Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "index.html"));
});

// Feed
app.get("/feed", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "feed.html"));
});

// Add Recipe
app.get("/add", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "add.html"));
});

// Insights
app.get("/insights", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "insights.html"));
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

// GET ALL RECIPES
app.get("/recipes", async (req, res) => {
  const recipes = await Recipe.findAll();
  res.json(recipes);
});

// ADD NEW RECIPE
app.post("/recipes", async (req, res) => {
  try {
    const recipe = await Recipe.create({
      title: req.body.title,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      imageUrl: req.body.imageUrl,
      createdBy: req.body.createdBy,
      category: req.body.category,
    });

    res.json(recipe);
  } catch (err) {
    console.error("Error creating recipe:", err);
    res.status(400).json({ error: "Invalid recipe data" });
  }
});

// LIKE A RECIPE
app.post("/recipes/:id/like", async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id);

  if (!recipe) return res.status(404).json({ error: "Recipe not found" });

  recipe.likes += 1;
  await recipe.save();

  res.json({ likes: recipe.likes });
});

// --------------------------------------------------
// START SERVER (Render-compatible)
// --------------------------------------------------
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log("Database synced!");
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
