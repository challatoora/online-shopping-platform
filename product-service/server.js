require("dotenv").config();

const express = require("express");
const db = require("./db");
const productRoutes = require("./routes/productRoutes");

const app = express();

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