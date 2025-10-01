const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = 3000;

let connection;

(async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connected to MySQL database");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

app.get("/", (req, res) => {
  res.send("🚀 Welcome to HealthPal API");
});

app.get("/health", async (req, res) => {
  try {
    await connection.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/tables", async (req, res) => {
  try {
    const [rows] = await connection.query("SHOW TABLES");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/roles", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM roles");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
