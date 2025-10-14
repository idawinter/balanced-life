// index.js
// Import the express library
const express = require("express");

// Create an Express app
const app = express();

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello from Balanced Life backend!");
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
