require("dotenv").config();

const express = require("express");
const db = require("./db");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://34.228.24.183:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Product Service is running");
});

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            service: "Product Service",
            database: "Connected",
            status: "OK"
        });
    } catch (error) {
        res.status(500).json({
            status: "Database connection failed"
        });
    }
});

app.use("/products", productRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});