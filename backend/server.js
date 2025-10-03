// server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// 🚨 CHANGE: Using 'mysql2/promise' for native async/await query support
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;
const saltRounds = 10;

// Middleware setup
app.use(cors());
app.use(express.json());

// Database Connection Details are filled from the .env file
// 🚨 CHANGE: Use mysql.createPool instead of createConnection for better connection management
let db;

(async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
        });
        console.log(`Connected to MySQL database: ${process.env.DB_DATABASE}`);

        // Start the server only after the database connection is established
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    } catch (err) {
        console.error(`Database connection failed to ${process.env.DB_DATABASE}:`, err.message);
        process.exit(1);
    }
})();

// ======================================================================
// SECURE REGISTRATION ROUTE (Now fully async/await)
// ======================================================================
app.post('/api/register', async (req, res) => {
    const { username, roll_number, gender, email, phone_number, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds); 
        
        const sql = `INSERT INTO users (username, roll_number, gender, email, phone_number, password, role) 
                     VALUES (?, ?, ?, ?, ?, ?, 0)`; // Default role is 0 (Student)
        
        const values = [username, roll_number || null, gender || null, email || null, phone_number || null, hashedPassword];

        const [result] = await db.execute(sql, values); // 🚨 CHANGE: Using await db.execute()
        
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful. User created.',
            userId: result.insertId 
        });

    } catch (error) {
        // Handle MySQL duplicate entry error (ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'User already exists (username, email, or roll number).' });
        }
        console.error('Registration error:', error.message);
        res.status(500).json({ success: false, error: 'A server error occurred during registration.' });
    }
});

// ======================================================================
// SECURE LOGIN ROUTE (Now fully async/await)
// ======================================================================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const sql = 'SELECT id, username, password, role FROM users WHERE username = ?';
    
    try {
        const [results] = await db.execute(sql, [username]); // 🚨 CHANGE: Using await db.execute()

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];
        const hashedPassword = user.password; 

        // 2. Use bcrypt.compare for secure password checking
        const match = await bcrypt.compare(password, hashedPassword);
        
        if (match) {
            let dashboardPath = (user.role == 1) ? '/admin/dashboard' : './stud.html';
            
            const userResponse = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            return res.json({ 
                success: true, 
                message: 'Login successful',
                user: userResponse,
                dashboardUrl: dashboardPath
            });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login processing error:', error.message);
        return res.status(500).json({ success: false, error: 'A server error occurred during login.' });
    }
});

// ======================================================================
// GET USER DETAILS ROUTE (Now fully async/await)
// ======================================================================
app.get('/api/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const sql = 'SELECT id, username, roll_number, gender, email, phone_number, role FROM users WHERE id = ?';
        
        const [results] = await db.execute(sql, [userId]); // 🚨 CHANGE: Using await db.execute()

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, user: results[0] });

    } catch (err) {
        console.error('Database query error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to retrieve user data.' });
    }
});

// ======================================================================
// GET ALL STUDENTS ROUTE (Now fully async/await)
// ======================================================================
app.get('/api/students', async (req, res) => {
    try {
        const sql = 'SELECT id, username, roll_number, email, phone_number, role FROM users WHERE role = 0';
        
        const [results] = await db.execute(sql); // 🚨 CHANGE: Using await db.execute()
        
        res.json({ success: true, students: results });

    } catch (err) {
        console.error('Database query error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to retrieve student list.' });
    }
});

// ======================================================================
// CATCH-ALL: Handle undefined routes 
// ======================================================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found. Check the URL and method.'
    });
});