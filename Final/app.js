// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup (SQLite via Sequelize) ---
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'data', 'chic_city_eats.sqlite'),
  logging: false
});

// Models
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  display_name: {
    type: DataTypes.STRING(100)
  }
});

const Restaurant = sequelize.define('Restaurant', {
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cuisine: {
    type: DataTypes.STRING(100)
  },
  price_range: {
    type: DataTypes.STRING(10) // $, $$, $$$
  },
  image_url: {
    type: DataTypes.TEXT
  }
});

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review_text: {
    type: DataTypes.TEXT
  }
});

// Associations
User.hasMany(Restaurant, { foreignKey: 'created_by_user_id' });
Restaurant.belongsTo(User, { as: 'creator', foreignKey: 'created_by_user_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Restaurant.hasMany(Review, { foreignKey: 'restaurant_id' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, styles.css, script.js) from this folder
app.use(express.static(__dirname));

// --- Simple health check route ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chic City Eats backend is running ✨' });
});

// --- Seed route: quickly load demo data for testing ---
app.post('/api/seed', async (req, res) => {
  try {
    // Only seed if DB is empty
    const count = await Restaurant.count();
    if (count > 0) {
      return res.json({ ok: true, message: 'Already seeded, skipping.' });
    }

    const gianna = await User.create({
      username: 'gianna',
      display_name: 'Gianna S'
    });

    const r1 = await Restaurant.create({
      name: 'Forte dei Miami',
      city: 'Miami Beach',
      cuisine: 'Italian Coastal',
      price_range: '$$$',
      image_url: 'https://via.placeholder.com/400x250?text=Forte+dei+Miami',
      created_by_user_id: gianna.id
    });

    const r2 = await Restaurant.create({
      name: 'Sunset Taco Club',
      city: 'Wynwood',
      cuisine: 'Modern Mexican',
      price_range: '$$',
      image_url: 'https://via.placeholder.com/400x250?text=Sunset+Taco+Club',
      created_by_user_id: gianna.id
    });

    await Review.bulkCreate([
      {
        rating: 5,
        review_text: 'Perfect date night vibe, handmade pasta was insane.',
        user_id: gianna.id,
        restaurant_id: r1.id
      },
      {
        rating: 4,
        review_text: 'Great cocktails and rooftop sunset, tacos were solid.',
        user_id: gianna.id,
        restaurant_id: r2.id
      }
    ]);

    res.json({ ok: true, message: 'Seeded demo data.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Seeding failed' });
  }
});

// --- API: get restaurants + their basic review stats ---
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [
        {
          model: Review,
          attributes: ['id', 'rating', 'review_text', 'user_id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add computed fields for average rating + count
    const enriched = restaurants.map(r => {
      const plain = r.toJSON();
      const reviews = plain.Reviews || [];
      const count = reviews.length;
      const avg =
        count === 0
          ? null
          : Number(
              (
                reviews.reduce((sum, rv) => sum + rv.rating, 0) / count
              ).toFixed(1)
            );
      return {
        ...plain,
        review_count: count,
        avg_rating: avg
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// --- API: add a new restaurant ---
app.post('/api/restaurants', async (req, res) => {
  try {
    const { username, name, city, cuisine, price_range, image_url } = req.body;

    if (!username || !name || !city) {
      return res
        .status(400)
        .json({ error: 'username, name, and city are required.' });
    }

    // Find or create the user who is submitting this restaurant
    const [user] = await User.findOrCreate({
      where: { username },
      defaults: { display_name: username }
    });

    const restaurant = await Restaurant.create({
      name,
      city,
      cuisine,
      price_range,
      image_url,
      created_by_user_id: user.id
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// --- API: add a review for a restaurant ---
app.post('/api/restaurants/:id/reviews', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { username, rating, review_text } = req.body;

    if (!username || !rating) {
      return res
        .status(400)
        .json({ error: 'username and rating are required.' });
    }

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    // Find or create user
    const [user] = await User.findOrCreate({
      where: { username },
      defaults: { display_name: username }
    });

    const review = await Review.create({
      rating,
      review_text,
      user_id: user.id,
      restaurant_id: restaurant.id
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// --- Start server & sync DB ---
async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // In dev you could use { alter: true } if needed
    console.log('✅ Database connected & synced');

    app.listen(PORT, () => {
      console.log(`🚀 Chic City Eats server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

start();
