require('dotenv').config(); 
const express = require('express');
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));



const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/auth');  
const rolesRoutes = require('./src/routes/rolesRoutes');  

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);

app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
