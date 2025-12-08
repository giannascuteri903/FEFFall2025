// Final/models/index.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLite and store the DB in db.sqlite in the project root
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db.sqlite'),
  logging: false, // turn off SQL logging spam
});

// Import models
const Restaurant = require('./Restaurant')(sequelize);
const Review = require('./Review')(sequelize);

// Associations: one restaurant has many reviews
Restaurant.hasMany(Review, { foreignKey: 'restaurantId', onDelete: 'CASCADE' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

module.exports = {
  sequelize,
  Restaurant,
  Review,
};
