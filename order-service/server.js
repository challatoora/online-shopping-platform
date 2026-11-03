require("dotenv").config();

const express = require("express");
const db = require("./db");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Order Service is running");
});

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
            status: "Database connection failed"
        });
    }
});

app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});