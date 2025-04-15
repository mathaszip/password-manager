const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database connection
const sequelize = require("./config/database");

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Define routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/passwords", require("./routes/passwords"));
app.use("/api/testimonials", require("./routes/testimonials"));

// Base route
app.get("/", (req, res) => {
  res.send("Password Manager API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

// Sync models with database
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
