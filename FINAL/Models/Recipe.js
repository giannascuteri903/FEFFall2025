const { sequelize } = require("./index");  
const { DataTypes } = require("sequelize");

const Recipe = sequelize.define("Recipe", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ingredients: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: true
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0   // IMPORTANT!!!
    },
    category: {
    type: DataTypes.STRING,
    allowNull: false
    }

});

module.exports = Recipe;
