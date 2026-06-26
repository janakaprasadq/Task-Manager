const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Use the authentication and task routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});