const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
}

// Get all users
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, name, email, created_at FROM users"
        );

        res.json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID
router.get("/:id", async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(users[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update own user details
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        if (Number(req.params.id) !== req.user.id) {
            return res.status(403).json({
                message: "You can update only your own account"
            });
        }

        const { name, email } = req.body;

        const [result] = await db.execute(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({ message: "User updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete own account
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        if (Number(req.params.id) !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own account"
            });
        }

        const [result] = await db.execute(
            "DELETE FROM users WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;