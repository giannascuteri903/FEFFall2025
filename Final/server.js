// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize, Spot, Review } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// Serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// ---------- API ROUTES ----------

// Get all spots with their reviews
app.get("/api/spots", async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [{ model: Review }],
      order: [["createdAt", "DESC"]]
    });
    res.json(spots);
  } catch (err) {
    console.error("Error fetching spots:", err);
    res.status(500).json({ error: "Failed to fetch spots" });
  }
});

// Create a new spot
app.post("/api/spots", async (req, res) => {
  try {
    const { username, name, city, cuisine, priceRange, imageUrl } = req.body;

    if (!username || !name || !city || !cuisine || !priceRange) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const spot = await Spot.create({
      username,
      name,
      city,
      cuisine,
      priceRange,
      imageUrl: imageUrl || null
    });

    res.status(201).json(spot);
  } catch (err) {
    console.error("Error creating spot:", err);
    res.status(500).json({ error: "Failed to create spot" });
  }
});

// Get all reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: Spot }],
      order: [["createdAt", "DESC"]]
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Create a new review
app.post("/api/reviews", async (req, res) => {
  try {
    const { username, rating, text, spotId } = req.body;

    if (!username || !rating || !spotId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ensure spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    const review = await Review.create({
      username,
      rating,
      text: text || "",
      spotId
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Simple summary endpoint (optional, can help for stats)
app.get("/api/summary", async (req, res) => {
  try {
    const [spotCount, reviews] = await Promise.all([
      Spot.count(),
      Review.findAll()
    ]);

    if (reviews.length === 0) {
      return res.json({
        spotCount,
        reviewCount: 0,
        averageRating: null
      });
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = totalRating / reviews.length;

    res.json({
      spotCount,
      reviewCount: reviews.length,
      averageRating: Number(avg.toFixed(2))
    });
  } catch (err) {
    console.error("Error building summary:", err);
    res.status(500).json({ error: "Failed to get summary" });
  }
});

// ---------- START SERVER ----------
async function start() {
  try {
    await sequelize.sync(); // sync DB
    console.log("Database synced ✅");

    app.listen(PORT, () => {
      console.log(`Chic City Eats listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

start();
