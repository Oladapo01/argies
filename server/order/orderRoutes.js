const express = require('express');
const orderController = require('./orderController');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/checkout', orderController.checkout);
router.get('/:orderNumber', orderController.getOrderByNumber);

// Admin routes
router.get('/', authenticateAdmin, orderController.getAllOrders);
router.patch('/:id/status', authenticateAdmin, orderController.updateOrderStatus);

module.exports = router;