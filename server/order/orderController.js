const axios = require('axios');
const Order = require('../models/Order');
const emailService = require('../email/emailService');
const paypal = require('@paypal/checkout-server-sdk');

// PayPal Environment Setup
const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

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
 * Verify PayPal payment
 */
const verifyPayPalPayment = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client.execute(request);
    return order.result;
  } catch (error) {
    console.error('PayPal verification error:', error);
    throw error;
  }
};

/**
 * Create a new order and process payment
 * @route POST /api/orders/checkout
 */
exports.checkout = async (req, res) => {
  try {
    const { items, total, customer, delivery, payment, specialInstructions, paypalOrderId } = req.body;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Handle PayPal payments
    if (payment && payment.method === 'paypal') {
      try {
        // Verify PayPal payment if paypalOrderId is provided
        if (paypalOrderId) {
          const paypalOrder = await verifyPayPalPayment(paypalOrderId);
          
          // Verify payment amount matches
          const paidAmount = parseFloat(paypalOrder.purchase_units[0].amount.value);
          if (Math.abs(paidAmount - total) > 0.01) {
            return res.status(400).json({
              success: false,
              message: 'Payment amount mismatch'
            });
          }

          // Verify payment is completed
          if (paypalOrder.status !== 'COMPLETED') {
            return res.status(400).json({
              success: false,
              message: 'PayPal payment not completed'
            });
          }

          // Create order with PayPal details
          const order = await Order.create({
            orderNumber,
            items,
            total,
            customer,
            delivery,
            payment: {
              ...payment,
              transactionId: paypalOrder.id,
              payerEmail: paypalOrder.payer?.email_address,
              status: 'completed'
            },
            specialInstructions,
            status: 'paid',
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
              paymentIntent: {
                ...payment,
                transactionId: paypalOrder.id
              },
              orderDate: new Date().toLocaleDateString()
            });
          } catch (emailError) {
            console.error('Error sending order emails:', emailError);
          }

          return res.status(201).json({
            success: true,
            orderId: orderNumber,
            paypalTransactionId: paypalOrder.id,
            order
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'PayPal order ID required for PayPal payments'
          });
        }
      } catch (error) {
        console.error('PayPal payment error:', error);
        return res.status(400).json({
          success: false,
          message: 'PayPal payment verification failed',
          error: error.message
        });
      }
    }

    // Handle SumUp card payments
    if (payment && payment.method === 'sumup') {
      try {
        const sumupAccessToken = process.env.SUMUP_ACCESS_TOKEN;
        const sumupEmail = process.env.SUMUP_EMAIL;

        // Call SumUp API to create a checkout
        const sumupRes = await axios.post(
          'https://api.sumup.com/v0.1/checkouts',
          {
            amount: total.toFixed(2),
            currency: 'GBP',
            checkout_reference: orderNumber,
            pay_to_email: sumupEmail,
            title: 'Argies Cake Order',
            description: `Order for ${customer.name}`,
            return_url: process.env.SUMUP_RETURN_URL || `${process.env.FRONTEND_URL}/order-success`,
          },
          {
            headers: {
              Authorization: `Bearer ${sumupAccessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Respond with the SumUp checkout URL
        return res.json({ 
          success: true,
          checkout_url: sumupRes.data.checkout_url,
          orderNumber 
        });
      } catch (error) {
        console.error('SumUp payment error:', error.response?.data || error.message);
        return res.status(400).json({
          success: false,
          message: 'SumUp payment processing failed',
          error: error.message
        });
      }
    }

    // For cash payments (no external payment processor needed)
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
    } catch (emailError) {
      console.error('Error sending order emails:', emailError);
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
 * Create PayPal order (for frontend integration)
 * @route POST /api/orders/paypal/create-order
 */
exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency = 'GBP' } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: 'Argies Bakery Order'
      }]
    });

    const order = await client.execute(request);

    res.json({
      success: true,
      orderId: order.result.id
    });
  } catch (error) {
    console.error('Create PayPal order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.message
    });
  }
};

/**
 * Capture PayPal payment
 * @route POST /api/orders/paypal/capture-order
 */
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    res.json({
      success: true,
      capture: capture.result
    });
  } catch (error) {
    console.error('Capture PayPal order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment',
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