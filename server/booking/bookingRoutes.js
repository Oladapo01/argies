const express = require('express');
const bookingController = require('./bookingController');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();


// Public routes
// Create a new booking
router.post('/', bookingController.createBooking);

// Get a single booking by ID (for customers to check their booking)
router.get('/public/:id', bookingController.getPublicBookingById);

// Admin-only routes (protected)
// Get all bookings - admin only
router.get('/', authenticateAdmin, bookingController.getBookings);

// Get a single booking by ID with full details - admin only
router.get('/:id', authenticateAdmin, bookingController.getBookingById);

// Update booking status - admin only
router.patch('/:id/status', authenticateAdmin, bookingController.updateBookingStatus);

// Delete a booking - admin only
router.delete('/:id', authenticateAdmin, bookingController.deleteBooking);

module.exports = router;