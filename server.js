const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files for profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sakshi@123',
    database: 'skill_barter'
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL');
});

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

/* ========== API Routes ========== */

// 🔹 Register User
app.post('/api/register', upload.single('profileImage'), async (req, res) => {
    const { username, email, password } = req.body;
    const profilePhoto = req.file?.filename;

    if (!username || !email || !password || !profilePhoto) {
        return res.status(400).json({ error: 'All fields including photo are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, email, password, profilePhoto) VALUES (?, ?, ?, ?)';
        db.query(sql, [username, email, hashedPassword, profilePhoto], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                console.error('❌ Registration error:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            res.status(201).json({ message: 'User registered successfully' });
        });

    } catch (err) {
        console.error('❌ Hash error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🔹 User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password' });

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto
            }
        });
    });
});

// 🔹 Post a Skill
app.post('/api/post-skill', (req, res) => {
    const { skillName, yourName, description } = req.body;

    if (!skillName || !yourName || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO skills (skillName, yourName, description) VALUES (?, ?, ?)';
    db.query(sql, [skillName, yourName, description], (err, result) => {
        if (err) {
            console.error("❌ Database Insert Error:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query('SELECT COUNT(*) AS count FROM skills', (err, countResult) => {
            if (err) {
                console.error("❌ Count Fetch Error:", err);
                return res.status(500).json({ error: 'Error fetching skill count' });
            }

            res.status(201).json({ message: 'Skill added successfully', count: countResult[0].count });
        });
    });
});

// 🔹 Get All Skills
app.get('/api/skills', (req, res) => {
    db.query('SELECT * FROM skills', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// 🔹 Get Skill Count
app.get('/api/skill-count', (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM skills', (err, result) => {
        if (err) return res.status(500).json({ error: 'Error fetching skill count' });
        res.json({ count: result[0].count });
    });
});

// 🔹 Get Skills by User
app.get('/api/skills-by-user', (req, res) => {
    const yourName = req.query.yourName;
    if (!yourName) return res.status(400).json({ error: 'Your name is required' });

    const sql = 'SELECT * FROM skills WHERE yourName = ?';
    db.query(sql, [yourName], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json(results);
    });
});

// 🔹 Delete a Skill
app.delete('/api/delete-skill/:id', (req, res) => {
    const skillId = req.params.id;
    db.query('DELETE FROM skills WHERE id = ?', [skillId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete skill' });
        res.json({ message: 'Skill deleted successfully' });
    });
});

// 🔹 Update a Skill
app.put('/api/update-skill/:id', (req, res) => {
    const skillId = req.params.id;
    const { skillName, description } = req.body;

    if (!skillName || !description) {
        return res.status(400).json({ error: 'Skill name and description are required' });
    }

    const sql = 'UPDATE skills SET skillName = ?, description = ? WHERE id = ?';
    db.query(sql, [skillName, description, skillId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update skill' });
        res.json({ message: 'Skill updated successfully' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
