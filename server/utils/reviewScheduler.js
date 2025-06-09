const cron = require('node-cron');
const reviewService = require('../services/reviewService');

class ReviewScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.runCount = 0;
    this.lastResult = null;
  }

  /**
   * Start the scheduled review fetching
   */
  start() {
    console.log('🕐 Starting review scheduler...');
    
    // Run daily at 3:00 AM (when traffic is typically lowest)
    // Cron format: second minute hour day month dayOfWeek
    const schedule = '0 0 3 * * *'; // Every day at 3:00 AM
    
    // Alternative schedules for testing:
    // const schedule = '*/5 * * * *';     // Every 5 minutes (for testing)
    // const schedule = '0 */6 * * *';     // Every 6 hours
    // const schedule = '0 0 */12 * * *';  // Every 12 hours

    this.scheduledTask = cron.schedule(schedule, async () => {
      await this.runScheduledFetch();
    }, {
      scheduled: false, // Don't start immediately
      timezone: "Europe/London" // Set to your timezone
    });

    // Start the scheduled task
    this.scheduledTask.start();
    
    // Calculate next run time
    this.updateNextRunTime();
    
    console.log(`✅ Review scheduler started`);
    console.log(`📅 Schedule: Daily at 3:00 AM (Europe/London)`);
    console.log(`⏰ Next run: ${this.nextRun}`);

    // Run immediately on startup if no reviews exist in database
    this.runInitialFetchIfNeeded();
  }

  /**
   * Stop the scheduled task
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.destroy();
      console.log('🛑 Review scheduler stopped');
    }
  }

  /**
   * Run the scheduled fetch
   */
  async runScheduledFetch() {
    if (this.isRunning) {
      console.log('⚠️ Review fetch already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    this.runCount++;

    console.log(`\n🚀 Starting scheduled review fetch #${this.runCount}`);
    console.log(`📅 Started at: ${this.lastRun.toLocaleString('en-GB')}`);

    try {
      const result = await reviewService.fetchAndSaveGoogleReviews();
      this.lastResult = result;

      if (result.success) {
        console.log(`✅ Scheduled fetch completed successfully`);
        console.log(`📊 Results: ${result.fetched} fetched, ${result.saved} saved`);
      } else {
        console.log(`⚠️ Scheduled fetch completed with issues: ${result.message}`);
      }

    } catch (error) {
      console.error(`❌ Scheduled fetch failed:`, error);
      this.lastResult = {
        success: false,
        message: error.message,
        error: error
      };
    } finally {
      this.isRunning = false;
      this.updateNextRunTime();
      console.log(`⏰ Next scheduled run: ${this.nextRun}\n`);
    }
  }

  /**
   * Run manual fetch (for testing or admin trigger)
   */
  async runManualFetch() {
    console.log('🔧 Running manual review fetch...');
    
    if (this.isRunning) {
      return {
        success: false,
        message: 'Fetch already in progress'
      };
    }

    try {
      const result = await reviewService.fetchAndSaveGoogleReviews();
      console.log('🔧 Manual fetch completed');
      return result;
    } catch (error) {
      console.error('❌ Manual fetch failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Run initial fetch if database is empty
   */
  async runInitialFetchIfNeeded() {
    try {
      const stats = await reviewService.getStats();
      
      if (stats.totalReviews === 0) {
        console.log('📭 No reviews in database, running initial fetch...');
        setTimeout(async () => {
          await this.runScheduledFetch();
        }, 5000); // Wait 5 seconds for system to fully start
      } else {
        console.log(`📊 Found ${stats.totalReviews} existing reviews in database`);
      }
    } catch (error) {
      console.error('Error checking initial fetch need:', error);
    }
  }

  /**
   * Update next run time calculation
   */
  updateNextRunTime() {
    // Calculate next 3:00 AM
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);
    
    this.nextRun = tomorrow.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.scheduledTask?.running || false,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      runCount: this.runCount,
      lastResult: this.lastResult
    };
  }

  /**
   * Get detailed status for admin dashboard
   */
  async getDetailedStatus() {
    const basicStatus = this.getStatus();
    const stats = await reviewService.getStats();
    
    return {
      ...basicStatus,
      ...stats,
      schedule: 'Daily at 3:00 AM (Europe/London)',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}

// Create and export singleton instance
const reviewScheduler = new ReviewScheduler();

module.exports = reviewScheduler;