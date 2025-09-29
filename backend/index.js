const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('HealthPal API OK'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/patients', async (req, res) => {
  try {
    // إن لم توجد جدول patients، سيرجع خطأ — لكن هذا مثال
    const [rows] = await pool.query('SELECT * FROM patients LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error or table not found' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
