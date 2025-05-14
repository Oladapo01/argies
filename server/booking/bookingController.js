const nodemailer = require('nodemailer');
const Booking = require('./bookingModel');
const emailService = require('../email/emailService');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Create a new booking
 */
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    // Send confirmation email
    await emailService.sendBookingConfirmation(booking, transporter);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Get all bookings
 */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get a single booking by ID
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

/**
 * Update booking status
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // If status is changed to completed, send a thank you email
    if (status === 'completed') {
      const thankYouHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://yourcakecompany.com/logo.png" alt="Cake Company Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #FF69B4; text-align: center;">Thank You!</h2>
          <p>Dear ${booking.customerName},</p>
          <p>We hope you enjoyed your cake! Thank you for choosing Cake Company for your special occasion.</p>
          <p>We'd love to hear your feedback. Please consider leaving us a review on <a href="https://g.page/cakecompany">Google</a> or <a href="https://www.instagram.com/cakecompany">Instagram</a>.</p>
          <p>We look forward to serving you again!</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.8em;">
            <p>Cake Company | 123 Cake Street | Sweet Town, ST 12345</p>
            <p>&copy; ${new Date().getFullYear()} Cake Company. All rights reserved.</p>
          </div>
        </div>
      `;
      
      await transporter.sendMail({
        from: `"Cake Company" <${process.env.EMAIL_USER}>`,
        to: booking.customerEmail,
        subject: `Thank You for Your Order - Cake Company`,
        html: thankYouHtml
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

/**
 * Get a public booking by ID (limited information for customers)
 */
exports.getPublicBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Return limited information for public view
    const publicBookingInfo = {
      id: booking._id,
      status: booking.status,
      deliveryDate: booking.deliveryDate,
      cakeType: booking.cakeType,
      cakeSize: booking.cakeSize,
      createdAt: booking.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: publicBookingInfo
    });
  } catch (error) {
    console.error('Error fetching public booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

/**
 * Delete a booking
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};