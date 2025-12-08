// Final/models/Restaurant.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
    },
    cuisine: {
      type: DataTypes.STRING,
    },
    priceRange: {
      // $, $$, $$$
      type: DataTypes.STRING,
    },
    imageUrl: {
      type: DataTypes.TEXT,
    },
  });

  return Restaurant;
};
