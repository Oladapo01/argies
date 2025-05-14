const cron = require('node-cron');
const Booking = require('../booking/bookingModel');
const emailService = require('../email/emailService');

/**
 * Send delivery reminders 2 days before scheduled delivery
 * Runs every day at 9:00 AM
 */
const sendDeliveryReminders = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running scheduled task: Send delivery reminders');
    
    // Calculate date for 2 days from now
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    // Set time to beginning of day
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    // Calculate end of day
    const endOfDay = new Date(twoDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find bookings scheduled for delivery in 2 days
    const bookings = await Booking.find({
      deliveryDate: {
        $gte: twoDaysFromNow,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'preparing'] }
    });
    
    console.log(`Found ${bookings.length} bookings for reminder emails`);
    
    // Send reminder emails
    for (const booking of bookings) {
      try {
        await emailService.sendDeliveryReminder(booking);
        console.log(`Sent reminder email for booking #${booking._id}`);
      } catch (error) {
        console.error(`Error sending reminder email for booking #${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in delivery reminder scheduled task:', error);
  }
});

// Export scheduled tasks
module.exports = {
  sendDeliveryReminders
};