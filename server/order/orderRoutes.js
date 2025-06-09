const express = require('express');
const orderController = require('./orderController');
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Public routes
router.post('/checkout', orderController.checkout);
router.get('/:orderNumber', orderController.getOrderByNumber);

// PayPal specific routes
router.post('/paypal/create-order', orderController.createPayPalOrder);
router.post('/paypal/capture-order', orderController.capturePayPalOrder);

// Admin routes
router.get('/', authenticateAdmin, orderController.getAllOrders);
router.patch('/:id/status', authenticateAdmin, orderController.updateOrderStatus);

module.exports = router;