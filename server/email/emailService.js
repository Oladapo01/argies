const nodemailer = require('nodemailer');

// Create a transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send booking confirmation email to customer
 */
exports.sendBookingConfirmation = async (booking) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `Argies Cake <${process.env.BUSINESS_EMAIL}>`,
    to: booking.customerEmail,
    subject: 'Your Cake Booking Confirmation',
    text: `Hi ${booking.customerName},\n\nThank you for booking a cake with Argies Cake!\n\nCake Type: ${booking.cakeType}\nPickup Date: ${booking.pickupDate.toDateString()}\n\nWe look forward to serving you!`,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send booking notification to business owner
 */
exports.sendBookingNotification = async (booking) => {
  const transporter = createTransporter();
  
  const ownerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF69B4;">New Cake Booking!</h2>
      <p><strong>Booking Reference:</strong> #${booking._id}</p>
      <p><strong>Booking Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Customer:</strong> ${booking.customerName}</p>
      <p><strong>Email:</strong> ${booking.customerEmail}</p>
      <p><strong>Phone:</strong> ${booking.customerPhone || 'Not provided'}</p>
      
      <h3 style="color: #FF69B4;">Cake Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Cake Type:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.cakeType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Size:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.cakeSize}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Flavor:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.cakeFlavor}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Delivery Date:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(booking.deliveryDate).toLocaleDateString()}</td>
        </tr>
        ${booking.deliveryAddress ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Delivery Address:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.deliveryAddress}</td>
        </tr>` : ''}
        ${booking.specialRequests ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Special Requests:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.specialRequests}</td>
        </tr>` : ''}
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <p><strong>Payment Status:</strong> ${booking.paymentIntentId ? 'Paid' : 'Pending'}</p>
        ${booking.paymentIntentId ? `<p><strong>Payment ID:</strong> ${booking.paymentIntentId}</p>` : ''}
      </div>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Cake Company Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Cake Booking #${booking._id} - Cake Company`,
    html: ownerEmailHtml
  });
};

/**
 * Send thank you email after booking is completed
 */
exports.sendThankYouEmail = async (booking) => {
  const transporter = createTransporter();
  
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
};

/**
 * Send order reminder email (2 days before delivery)
 */
exports.sendDeliveryReminder = async (booking) => {
  const transporter = createTransporter();
  
  const reminderHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://yourcakecompany.com/logo.png" alt="Cake Company Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #FF69B4; text-align: center;">Your Cake is Almost Ready!</h2>
      <p>Dear ${booking.customerName},</p>
      <p>Just a friendly reminder that your cake order will be ready in 2 days!</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> #${booking._id}</p>
        <p><strong>Delivery Date:</strong> ${new Date(booking.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Cake Type:</strong> ${booking.cakeType} (${booking.cakeSize})</p>
      </div>
      <p>If you need to make any last-minute changes, please contact us as soon as possible at <a href="mailto:hello@cakecompany.com">hello@cakecompany.com</a> or call (123) 456-7890.</p>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.8em;">
        <p>Cake Company | 123 Cake Street | Sweet Town, ST 12345</p>
        <p>&copy; ${new Date().getFullYear()} Cake Company. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Cake Company" <${process.env.EMAIL_USER}>`,
    to: booking.customerEmail,
    subject: `Your Cake Order Reminder - Cake Company`,
    html: reminderHtml
  });
};

/**
 * Send contact form confirmation
 */
exports.sendContactFormConfirmation = async (name, email, message) => {
  const transporter = createTransporter();
  
  // Send confirmation to user
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://yourcakecompany.com/logo.png" alt="Cake Company Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #FF69B4; text-align: center;">Thank You for Reaching Out!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for contacting Cake Company. We've received your message and will get back to you as soon as possible.</p>
      <p>For urgent inquiries, please call us at (123) 456-7890.</p>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.8em;">
        <p>Cake Company | 123 Cake Street | Sweet Town, ST 12345</p>
        <p>&copy; ${new Date().getFullYear()} Cake Company. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Cake Company" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thank you for contacting Cake Company`,
    html: customerHtml
  });
  
  // Send notification to business owner
  const ownerHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #FF69B4;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <h3>Message:</h3>
      <p>${message}</p>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Cake Company Website" <${process.env.EMAIL_USER}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Contact Form Submission - Cake Company`,
    html: ownerHtml
  });
};

/**
 * Send order receipt after payment
 */
exports.sendOrderReceipt = async (order) => {
  const transporter = createTransporter();
  
  // Format items for email
  const itemsList = order.items.map(item => {
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://yourcakecompany.com/logo.png" alt="Cake Company Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #FF69B4; text-align: center;">Order Confirmation</h2>
      <p>Dear ${order.customerInfo.name},</p>
      <p>Thank you for your order! We're excited to bake something special for you.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order Number:</strong> #${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${order.orderDate}</p>
      </div>
      <h3 style="color: #FF69B4;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; font-weight: bold;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top: 30px;">
        <h3 style="color: #FF69B4;">Next Steps</h3>
        <p>Your order is being processed. You'll receive a notification when it's ready for pickup.</p>
        <p>For any questions, please contact us at <a href="mailto:hello@cakecompany.com">hello@cakecompany.com</a> or call (123) 456-7890.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.8em;">
        <p>Cake Company | 123 Cake Street | Sweet Town, ST 12345</p>
        <p>&copy; ${new Date().getFullYear()} Cake Company. All rights reserved.</p>
      </div>
    </div>
  `;
  
  // Send email to customer
  await transporter.sendMail({
    from: `"Cake Company" <${process.env.EMAIL_USER}>`,
    to: order.customerInfo.email,
    subject: `Order Confirmation #${order.orderNumber} - Cake Company`,
    html: customerEmailHtml
  });
  
  // Send notification to business owner
  const ownerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF69B4;">New Order Received!</h2>
      <p><strong>Order Number:</strong> #${order.orderNumber}</p>
      <p><strong>Order Date:</strong> ${order.orderDate}</p>
      <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
      <p><strong>Email:</strong> ${order.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${order.customerInfo.phone || 'Not provided'}</p>
      
      <h3 style="color: #FF69B4;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; font-weight: bold;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <p><strong>Payment Status:</strong> Completed</p>
        <p><strong>Payment ID:</strong> ${order.paymentIntent.id}</p>
      </div>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Cake Company Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Order #${order.orderNumber} - Cake Company`,
    html: ownerEmailHtml
  });
};