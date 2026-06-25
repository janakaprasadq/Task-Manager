const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Simple test route to check database connectivity
app.get('/test-db', async (req, res) => {
    try {
        // Query the database to verify connectivity
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: "Database connection successful!", data: rows });
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});