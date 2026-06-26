const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register a new user

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Please provide name, email, and password." });
        }

        const [existingUser] = await db.query('SELECT * FROM users WHERE email=?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email is already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const finalRole = (role === "Admin") ? 'Admin' : 'User';

        const [result] = await db.query(
            'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
            [name, email, hashedPassword, finalRole]
        );

        res.status(201).json({
            message: "User registered successfully.",
            userId: result.insertId,
        })



    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error during registration." });
    }
};

// 2. Login an existing user

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password." });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' })
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })


    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error during login." });
    }
}
