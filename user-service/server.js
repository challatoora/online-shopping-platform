require("dotenv").config();

const express = require("express");
const db = require("./db");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Enable CORS for the frontend
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://100.48.89.167:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("User Service is running");
});

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            service: "User Service",
            database: "Connected",
            status: "OK"
        });

    } catch (error) {
        res.status(500).json({
            status: "Database connection failed"
        });
    }
});

// User routes: /users/register and /users/login
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service running on port ${PORT}`);
});