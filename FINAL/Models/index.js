const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./recipes.sqlite",
    logging: false
});

module.exports = { sequelize, Sequelize };
