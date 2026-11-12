
require("dotenv").config();

const express = require("express");
const db = require("./db");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// CORS configuration
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        "http://100.48.89.167:3000"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Parse JSON
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Order Service is running");
});

// Health check
app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            service: "Order Service",
            database: "Connected",
            status: "OK"
        });

    } catch (error) {
        res.status(500).json({
            service: "Order Service",
            database: "Disconnected",
            status: "ERROR"
        });
    }
});

// Order routes
app.use("/orders", orderRoutes);

// Start server
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
