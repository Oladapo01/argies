// server/auth/authRoutes.js
/**
 * Authentication routes
 */
const express = require('express');
const { register, login, getMe, createAdmin } = require('./authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me', authenticate, getMe);

// Create admin user (for initial setup only)
router.post('/create-admin', createAdmin);

module.exports = router;