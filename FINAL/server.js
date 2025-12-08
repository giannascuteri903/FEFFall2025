const sequelize = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Smart Recipe Book API is running..." });
});

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log("SQLite database synced ✔");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

const sequelize = require('./models/index');
const Recipe = require('./models/Recipe');

sequelize.sync().then(() => {
  console.log("Database synced!");
})
.catch(err => {
  console.error("Error syncing DB:", err);
});
