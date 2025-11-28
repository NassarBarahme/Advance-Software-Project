require('dotenv').config(); 
const express = require('express');
const app = express();

const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');  
const ngoRoutes = require('./src/routes/ngoRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const consultationsRoutes = require('./src/routes/consultationsRoutes');
const systemRoutes = require('./src/routes/systemRoutes');



const medicalCaseRoutes = require('./src/routes/medicalCaseRoutes');// sally********



app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);  
app.use('/api/ngos', ngoRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/consultations',consultationsRoutes);
app.use('/api/system', systemRoutes);



//app.use('/medical_cases', medicalCaseRoutes);// sally********
app.use('/api/medical-cases', medicalCaseRoutes);// sally********




app.get('/', (req, res) => {
  res.send('API is working!');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));