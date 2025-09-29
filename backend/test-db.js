// backend/test-db.js
const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1+1 AS result');
    console.log('DB connected, test query result:', rows);
    process.exit(0);
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
})();
