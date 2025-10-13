require('dotenv').config(); 
const express = require('express');
const app = express();

const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');  

app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);  

app.get('/', (req, res) => {
  res.send('API is working!');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));