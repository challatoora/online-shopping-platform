const express = require("express");
const db = require("../db");

const router = express.Router();

// Add product
router.post("/", async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        if (!name || price == null || stock == null ||
            Number(price) < 0 || !Number.isInteger(Number(stock)) ||
            Number(stock) < 0) {
            return res.status(400).json({
                message: "Valid name, price and stock are required"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO products (name, description, price, stock)
             VALUES (?, ?, ?, ?)`,
            [name, description || null, price, stock]
        );

        res.status(201).json({
            message: "Product added successfully",
            productId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all products
router.get("/", async (req, res) => {
    try {
        const [products] = await db.execute(
            "SELECT * FROM products"
        );

        res.json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get product by ID
router.get("/:id", async (req, res) => {
    try {
        const [products] = await db.execute(
            "SELECT * FROM products WHERE id = ?",
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(products[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update product
router.put("/:id", async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        if (!name || price == null || stock == null ||
            Number(price) < 0 || !Number.isInteger(Number(stock)) ||
            Number(stock) < 0) {
            return res.status(400).json({
                message: "Valid name, price and stock are required"
            });
        }

        const [result] = await db.execute(
            `UPDATE products
             SET name = ?, description = ?, price = ?, stock = ?
             WHERE id = ?`,
            [name, description || null, price, stock, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({ message: "Product updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM products WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;