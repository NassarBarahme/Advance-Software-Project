const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./src/config/database');

// Import Routes
const patientsRoutes = require('./src/routes/patients');
const healthContentRoutes = require('./src/routes/healthContent');
const healthAlertsRoutes = require('./src/routes/healthAlerts');
const doctorsRoutes = require('./src/routes/doctors');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');  


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    message: ' Welcome to HealthPal API',
    version: '1.0.0',
    endpoints: {
      patients: '/patients',
      healthContent: '/health_content',
      healthAlerts: '/health_alerts',
      doctors: '/doctors'
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// API Routes
app.use('/api/patients', patientsRoutes);
app.use('/api/health_content', healthContentRoutes);
app.use('/api/health_alerts', healthAlertsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);  

// Start Server
app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
  console.log(` API Documentation available at http://localhost:${port}`);
});
