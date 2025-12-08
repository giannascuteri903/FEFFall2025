const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "recipes.db"   // This file will be created automatically
});

module.exports = sequelize;
