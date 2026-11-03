require("dotenv").config();

const express = require("express");
const db = require("./db");
const userRoutes = require("./routes/userRoutes");

const app = express();

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

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});