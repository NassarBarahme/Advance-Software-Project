require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pool = require('./src/config/database');
const rolesRoutes = require('./src/routes/rolesRoutes');

const patientsRoutes = require('./src/routes/patients');
const healthContentRoutes = require('./src/routes/healthContent');
const healthAlertsRoutes = require('./src/routes/healthAlerts');
const doctorsRoutes = require('./src/routes/doctors');

const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');

const medicalCaseRoutes = require('./src/routes/medicalCaseRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const medicalInventoryRoutes = require('./src/routes/medicalInventoryRoutes');
const medicationRequestRoutes = require('./src/routes/medicationRequestRoutes');
const deliveryMatchRoutes = require('./src/routes/deliveryMatchRoutes');
const mentalHealthRoutes = require('./src/routes/mentalHealthRoutes');
const supportGroupRoutes = require('./src/routes/supportGroupRoutes');
const ngoRoutes = require('./src/routes/ngoRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const consultationsRoutes = require('./src/routes/consultationsRoutes');
const systemRoutes = require('./src/routes/systemRoutes');
app.use('/api/roles', rolesRoutes);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: ' Welcome to HealthPal API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      healthContent: '/api/health_content',
      healthAlerts: '/api/health_alerts',
      doctors: '/api/doctors'
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.use('/api/patients', patientsRoutes);
app.use('/api/health_content', healthContentRoutes);
app.use('/api/health_alerts', healthAlertsRoutes);
app.use('/api/doctors', doctorsRoutes);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/medical-cases', medicalCaseRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/medical_inventory', medicalInventoryRoutes);
app.use('/api/medication_requests', medicationRequestRoutes);
app.use('/api/delivery_matches', deliveryMatchRoutes);
app.use('/api/mental_health_sessions', mentalHealthRoutes);
app.use('/api/support_groups', supportGroupRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/system', systemRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});