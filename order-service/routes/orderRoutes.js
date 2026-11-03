const express = require("express");
const db = require("../db");

const router = express.Router();

// Create order
router.post("/", async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { user_id, items } = req.body;

        if (!Number.isInteger(Number(user_id)) ||
            Number(user_id) <= 0 ||
            !Array.isArray(items) ||
            items.length === 0) {
            return res.status(400).json({
                message: "Valid user_id and order items are required"
            });
        }

        // Verify user using User Service
        const userResponse = await fetch(
            `${process.env.USER_SERVICE_URL}/users/${user_id}`
        );

        if (!userResponse.ok) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify products and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);

            if (!Number.isInteger(productId) || productId <= 0 ||
                !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    message: "Each item needs a valid product_id and positive integer quantity"
                });
            }

            const productResponse = await fetch(
                `${process.env.PRODUCT_SERVICE_URL}/products/${productId}`
            );

            if (!productResponse.ok) {
                return res.status(400).json({
                    message: `Product ${productId} not found`
                });
            }

            const product = await productResponse.json();

            if (product.stock < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const price = Number(product.price);
            totalAmount += price * quantity;

            orderItems.push({
                product_id: product.id,
                quantity,
                price
            });
        }

        // Save order using a transaction
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
            `INSERT INTO orders (user_id, total_amount, status)
             VALUES (?, ?, ?)`,
            [user_id, totalAmount, "PENDING"]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await connection.execute(
                `INSERT INTO order_items
                 (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Order created successfully",
            orderId,
            userId: Number(user_id),
            totalAmount: totalAmount.toFixed(2),
            status: "PENDING",
            items: orderItems
        });

    } catch (error) {
        await connection.rollback();

        res.status(500).json({
            message: error.message
        });

    } finally {
        connection.release();
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const [orders] = await db.execute(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(orders);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID with items
router.get("/:id", async (req, res) => {
    try {
        const [orders] = await db.execute(
            "SELECT * FROM orders WHERE id = ?",
            [req.params.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const [items] = await db.execute(
            "SELECT * FROM order_items WHERE order_id = ?",
            [req.params.id]
        );

        res.json({
            order: orders[0],
            items
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "PENDING",
            "CONFIRMED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const [result] = await db.execute(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order status updated successfully",
            status
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete order
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM orders WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({ message: "Order deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;