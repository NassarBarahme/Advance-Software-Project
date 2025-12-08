require('dotenv').config();
const express = require('express');
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));



const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');
const medicalCaseRoutes = require('./src/routes/medicalCaseRoutes');

const donationRoutes = require('./src/routes/donationRoutes');
const medicalInventoryRoutes = require('./src/routes/medicalInventoryRoutes');

const medicationRequestRoutes = require('./src/routes/medicationRequestRoutes');
const deliveryMatchRoutes = require('./src/routes/deliveryMatchRoutes');
const mentalHealthRoutes = require("./src/routes/mentalHealthRoutes");
const supportGroupRoutes = require("./src/routes/supportGroupRoutes");

const ngoRoutes = require('./src/routes/ngoRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const consultationsRoutes = require('./src/routes/consultationsRoutes');
const systemRoutes = require('./src/routes/systemRoutes');







app.use(express.json());


app.use('/api/medical-cases', medicalCaseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/medical_inventory', medicalInventoryRoutes);
app.use('/api/medication_requests', medicationRequestRoutes);
app.use('/api/delivery_matches', deliveryMatchRoutes);
app.use("/api/mental_health_sessions", mentalHealthRoutes);
app.use("/api/support_groups", supportGroupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/consultations',consultationsRoutes);
app.use('/api/system', systemRoutes);







app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve HTML files explicitly
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));