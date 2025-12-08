// Final/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const { sequelize, Restaurant, Review } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve your static frontend (index.html, styles.css, script.js)
app.use(express.static(__dirname));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

//
// RESTAURANTS
//

// Get all restaurants (newest first)
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Create a new restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const { name, city, cuisine, priceRange, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const restaurant = await Restaurant.create({
      name,
      city,
      cuisine,
      priceRange,
      imageUrl,
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

//
// REVIEWS
//

// Get all reviews, optionally filtered by restaurantId
app.get('/api/reviews', async (req, res) => {
  try {
    const { restaurantId } = req.query;

    const where = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const reviews = await Review.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Restaurant }],
    });

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { username, rating, reviewText, restaurantId } = req.body;

    if (!username || !rating || !restaurantId) {
      return res.status(400).json({ error: 'username, rating, and restaurantId are required' });
    }

    const review = await Review.create({
      username,
      rating,
      reviewText,
      restaurantId,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

//
// Ratings summary for chart (1–5 counts)
//
app.get('/api/ratings-summary', async (req, res) => {
  try {
    const reviews = await Review.findAll({ attributes: ['rating'] });

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (counts[r.rating] !== undefined) {
        counts[r.rating] += 1;
      }
    }

    res.json(counts);
  } catch (err) {
    console.error('Error building ratings summary:', err);
    res.status(500).json({ error: 'Failed to build ratings summary' });
  }
});

// Start server after DB is ready
async function start() {
  try {
    await sequelize.sync(); // creates tables if they don't exist
    console.log('Database synced ✅');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
