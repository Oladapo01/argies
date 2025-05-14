const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate users
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Middleware to authenticate admin users
 */
exports.authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Admin privileges required' 
      });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};