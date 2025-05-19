const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const emailService = require('../email/emailService');

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
  const prefix = 'ARG';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * Create a new order and process payment
 * @route POST /api/checkout
 */
exports.checkout = async (req, res) => {
  try {
    const { items, total, customer, delivery, payment, specialInstructions } = req.body;
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Process payment if method is card
    if (payment.method === 'card') {
      try {
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Stripe uses cents
          currency: 'gbp',
          payment_method: payment.paymentMethodId,
          confirm: true,
          description: `Order #${orderNumber}`,
          receipt_email: customer.email
        });
        
        // If payment was not successful
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({
            success: false,
            message: 'Payment processing failed',
            paymentIntent
          });
        }
        
        // Add payment intent ID to payment object
        payment.paymentIntentId = paymentIntent.id;
        payment.status = 'paid';
      } catch (error) {
        console.error('Stripe payment error:', error);
        return res.status(400).json({
          success: false,
          message: 'Payment processing failed',
          error: error.message
        });
      }
    }
    
    // Create order in database
    const order = await Order.create({
      orderNumber,
      items,
      total,
      customer,
      delivery,
      payment,
      specialInstructions,
      status: 'new',
      createdAt: new Date()
    });
    
    // Send confirmation emails
    try {
      await emailService.sendOrderReceipt({
        orderNumber,
        items,
        total,
        customerInfo: customer,
        deliveryInfo: delivery,
        paymentIntent: payment,
        orderDate: new Date().toLocaleDateString()
      });
      
      console.log('Order confirmation emails sent successfully');
    } catch (emailError) {
      console.error('Error sending order emails:', emailError);
      // We don't want to fail the order if emails fail
    }
    
    res.status(201).json({
      success: true,
      orderId: orderNumber,
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing order',
      error: error.message
    });
  }
};

/**
 * Get order by number
 * @route GET /api/orders/:orderNumber
 */
exports.getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

/**
 * Get all orders (admin only)
 * @route GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};