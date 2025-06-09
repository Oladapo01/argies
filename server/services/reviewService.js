const axios = require('axios');
const Review = require('../models/Review');

class ReviewService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.googlePlaceId = process.env.GOOGLE_PLACE_ID;
    this.businessInfo = null;
    this.lastFetchTime = null;
  }

  /**
   * Fetch reviews from Google Places API and save to database
   */
  async fetchAndSaveGoogleReviews() {
    try {
      console.log('🔄 Starting Google reviews fetch...');
      
      if (!this.googleApiKey || !this.googlePlaceId) {
        console.log('⚠️ Google Places API not configured, skipping fetch');
        return { success: false, message: 'Google API not configured' };
      }

      // Fetch from Google Places API
      const googleData = await this.fetchFromGooglePlaces();
      
      if (!googleData.success) {
        return googleData;
      }

      // Save business info
      this.businessInfo = googleData.businessInfo;
      
      // Process and save reviews
      const savedReviews = [];
      const errors = [];

      for (const googleReview of googleData.reviews) {
        try {
          const savedReview = await this.saveReviewToDatabase(googleReview);
          if (savedReview) {
            savedReviews.push(savedReview);
          }
        } catch (error) {
          console.error(`Error saving review for ${googleReview.author_name}:`, error.message);
          errors.push(error.message);
        }
      }

      this.lastFetchTime = new Date();

      console.log(`✅ Google reviews fetch completed:`);
      console.log(`   📥 Fetched: ${googleData.reviews.length} reviews`);
      console.log(`   💾 Saved: ${savedReviews.length} new reviews`);
      console.log(`   ⚠️ Errors: ${errors.length}`);

      return {
        success: true,
        fetched: googleData.reviews.length,
        saved: savedReviews.length,
        errors: errors.length,
        businessInfo: this.businessInfo
      };

    } catch (error) {
      console.error('❌ Error in fetchAndSaveGoogleReviews:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Fetch reviews from Google Places API
   */
  async fetchFromGooglePlaces() {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json`;
      const params = {
        place_id: this.googlePlaceId,
        fields: 'name,rating,reviews,user_ratings_total',
        key: this.googleApiKey
      };

      console.log(`🌐 Calling Google Places API for place: ${this.googlePlaceId}`);
      
      const response = await axios.get(url, { params });

      if (response.data.status !== 'OK') {
        console.error('Google Places API error:', response.data);
        return {
          success: false,
          message: `Google API error: ${response.data.status}`,
          details: response.data.error_message
        };
      }

      const place = response.data.result;
      
      // Transform Google reviews to our format
      const reviews = (place.reviews || []).map(review => ({
        googleReviewId: `google_${review.time}`, // Create unique ID
        author_name: review.author_name,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time * 1000, // Convert to milliseconds
        relative_time_description: review.relative_time_description,
        source: 'google'
      }));

      const businessInfo = {
        name: place.name,
        rating: place.rating,
        total_ratings: place.user_ratings_total
      };

      return {
        success: true,
        reviews,
        businessInfo
      };

    } catch (error) {
      console.error('Error fetching from Google Places:', error);
      return {
        success: false,
        message: 'Failed to fetch from Google Places API',
        error: error.message
      };
    }
  }

  /**
   * Save a single review to database
   */
  async saveReviewToDatabase(reviewData) {
    try {
      // Check if review already exists
      const existingReview = await Review.findOne({
        googleReviewId: reviewData.googleReviewId
      });

      if (existingReview) {
        console.log(`📋 Review already exists: ${reviewData.author_name}`);
        return null;
      }

      // Create new review
      const review = new Review({
        googleReviewId: reviewData.googleReviewId,
        authorName: reviewData.author_name,
        authorPhotoUrl: reviewData.profile_photo_url,
        rating: reviewData.rating,
        text: reviewData.text,
        reviewTime: new Date(reviewData.time),
        relativeTimeDescription: reviewData.relative_time_description,
        source: reviewData.source || 'google',
        status: 'active',
        isPublic: true
      });

      const savedReview = await review.save();
      console.log(`💾 Saved new review: ${reviewData.author_name} (${reviewData.rating}⭐)`);
      
      return savedReview;

    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - review already exists
        console.log(`📋 Duplicate review skipped: ${reviewData.author_name}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Get reviews from database
   */
  async getReviewsFromDatabase(limit = 20, offset = 0) {
    try {
      const reviews = await Review.getActiveReviews(limit, offset);
      const ratingStats = await Review.getAverageRating();
      
      const businessInfo = ratingStats.length > 0 ? {
        name: this.businessInfo?.name || 'Argies Bakery',
        rating: Math.round(ratingStats[0].averageRating * 10) / 10,
        total_ratings: ratingStats[0].totalReviews
      } : null;

      return {
        success: true,
        reviews: reviews.map(review => review.toAPIResponse()),
        businessInfo,
        total: await Review.countDocuments({ status: 'active', isPublic: true })
      };

    } catch (error) {
      console.error('Error getting reviews from database:', error);
      return {
        success: false,
        message: 'Failed to get reviews from database',
        error: error.message
      };
    }
  }

  /**
   * Add manual review
   */
  async addManualReview(reviewData) {
    try {
      const review = new Review({
        authorName: reviewData.authorName,
        rating: reviewData.rating,
        text: reviewData.text,
        reviewTime: reviewData.reviewTime || new Date(),
        source: 'manual',
        status: 'active',
        isPublic: true
      });

      const savedReview = await review.save();
      console.log(`📝 Added manual review: ${reviewData.authorName}`);
      
      return {
        success: true,
        review: savedReview.toAPIResponse()
      };

    } catch (error) {
      console.error('Error adding manual review:', error);
      return {
        success: false,
        message: 'Failed to add manual review',
        error: error.message
      };
    }
  }

  /**
   * Get fallback reviews (in case database is empty)
   */
  getFallbackReviews() {
    return [
      {
        id: "fallback_1",
        author_name: "Sarah Johnson",
        rating: 5,
        text: "Absolutely amazing cakes! Ordered a chocolate cake for my daughter's birthday and it was perfect. Beautiful presentation and tasted incredible. Will definitely be ordering again!",
        time: Date.now() - (7 * 24 * 60 * 60 * 1000),
        source: "customer"
      },
      {
        id: "fallback_2", 
        author_name: "Michael Chen",
        rating: 5,
        text: "Best bakery in Southampton! Their sourdough is fantastic and the brownies are to die for. The staff is always friendly and helpful. Highly recommended!",
        time: Date.now() - (14 * 24 * 60 * 60 * 1000),
        source: "customer"
      },
      {
        id: "fallback_3",
        author_name: "Emma Williams", 
        rating: 5,
        text: "Ordered a custom wedding cake and it exceeded all expectations. Not only was it beautiful, but it tasted amazing too. Thank you for making our day special!",
        time: Date.now() - (21 * 24 * 60 * 60 * 1000),
        source: "customer"
      }
    ];
  }

  /**
   * Get fetch status and statistics
   */
  async getStats() {
    try {
      const totalReviews = await Review.countDocuments({ status: 'active' });
      const googleReviews = await Review.countDocuments({ status: 'active', source: 'google' });
      const manualReviews = await Review.countDocuments({ status: 'active', source: 'manual' });
      const ratingStats = await Review.getAverageRating();

      return {
        totalReviews,
        googleReviews,
        manualReviews,
        averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : null,
        lastFetchTime: this.lastFetchTime,
        isConfigured: !!(this.googleApiKey && this.googlePlaceId)
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

module.exports = new ReviewService();