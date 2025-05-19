const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const bookingRoutes = require('./booking/bookingRoutes');
const authRoutes = require('./auth/authRoutes');
const orderRoutes = require('./order/orderRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with retry logic
const connectWithRetry = async (retries = 5, interval = 5000) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}/${retries}...`);
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
      return true;
    } catch (err) {
      lastError = err;
      console.error(`MongoDB connection error (attempt ${i + 1}/${retries}):`, err.message);
      // Wait before retrying
      if (i < retries - 1) {
        console.log(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }
  
  console.error(`Failed to connect to MongoDB after ${retries} attempts:`, lastError);
  return false;
};

// Configure Express middleware and routes
const configureExpress = () => {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://placeholder-image.com", "https://*.cdninstagram.com", "https://*.tile.openstreetmap.org"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://*.tile.openstreetmap.org"],
        frameSrc: ["'self'", "https://js.stripe.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.'
    }
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // Standard middleware
  app.use(cors());
  app.use(bodyParser.json());

  // API Routes
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  }));

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : err.message
    });
  });
}

// Start the server only after MongoDB is connected
const startServer = async () => {
  // First connect to MongoDB
  const connected = await connectWithRetry();
  
  if (!connected) {
    console.error('Could not connect to MongoDB. Server will not start.');
    process.exit(1);
  }
  
  // Configure Express once MongoDB is connected
  configureExpress();
  
  // Start scheduled tasks
  try {
    require('./utils/scheduledTasks');
    console.log('Scheduled tasks loaded');
  } catch (error) {
    console.log('No scheduled tasks found or error loading them:', error.message);
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start the application
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});