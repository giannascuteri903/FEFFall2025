// models.js
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// SQLite database file in the project
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "chic-city-eats.sqlite"),
  logging: false
});

// Spot model – a place on the map
const Spot = sequelize.define("Spot", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cuisine: {
    type: DataTypes.STRING,
    allowNull: false
  },
  priceRange: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Review model – rating + quick note
const Review = sequelize.define("Review", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Relationships
Spot.hasMany(Review, { foreignKey: "spotId", onDelete: "CASCADE" });
Review.belongsTo(Spot, { foreignKey: "spotId" });

module.exports = { sequelize, Spot, Review };
