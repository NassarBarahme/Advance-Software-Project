// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'healthpal-db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'health_user',
  password: process.env.DB_PASSWORD || 'health_pass',
  database: process.env.DB_NAME || 'healthpal',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
