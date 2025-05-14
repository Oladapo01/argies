const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Please provide customer email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  customerPhone: {
    type: String,
    trim: true
  },
  cakeType: {
    type: String,
    required: [true, 'Please provide cake type'],
    trim: true
  },
  cakeSize: {
    type: String,
    required: [true, 'Please provide cake size'],
    trim: true
  },
  cakeFlavor: {
    type: String,
    required: [true, 'Please provide cake flavor'],
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Please provide delivery date']
  },
  deliveryAddress: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);