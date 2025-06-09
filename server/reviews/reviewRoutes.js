const express = require('express');
const reviewService = require('../services/reviewService');
const reviewScheduler = require('../utils/reviewScheduler');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

/**
 * Get reviews from database (cached from Google)
 * @route GET /api/reviews
 */
router.get('/reviews', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Get reviews from database
    const result = await reviewService.getReviewsFromDatabase(
      parseInt(limit), 
      parseInt(offset)
    );

    if (result.success) {
      // If we have reviews, return them
      if (result.reviews.length > 0) {
        return res.json({
          success: true,
          reviews: result.reviews,
          business_info: result.businessInfo,
          total: result.total,
          source: 'database'
        });
      }
    }

    // Fallback to manual reviews if database is empty or failed
    console.log('📋 Using fallback reviews');
    const fallbackReviews = reviewService.getFallbackReviews();
    
    res.json({
      success: true,
      reviews: fallbackReviews,
      business_info: {
        name: "Argies Bakery",
        rating: 4.9,
        total_ratings: 47
      },
      source: 'fallback'
    });

  } catch (error) {
    console.error('Reviews API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get Google reviews directly (legacy endpoint)
 * @route GET /api/google-reviews
 */
router.get('/google-reviews', async (req, res) => {
  try {
    // Redirect to cached reviews endpoint
    const result = await reviewService.getReviewsFromDatabase(20, 0);
    
    if (result.success) {
      return res.json({
        success: true,
        reviews: result.reviews,
        business_info: result.businessInfo,
        source: 'cached'
      });
    }

    throw new Error('Failed to get cached reviews');

  } catch (error) {
    console.error('Google Reviews API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Google reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Admin: Get review statistics and scheduler status
 * @route GET /api/admin/reviews/stats
 */
router.get('/admin/reviews/stats', authenticateAdmin, async (req, res) => {
  try {
    const status = await reviewScheduler.getDetailedStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review stats',
      error: error.message
    });
  }
});

/**
 * Admin: Manually trigger review fetch
 * @route POST /api/admin/reviews/fetch
 */
router.post('/admin/reviews/fetch', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔧 Admin triggered manual review fetch');
    const result = await reviewScheduler.runManualFetch();
    
    res.json({
      success: result.success,
      message: result.success ? 'Manual fetch completed' : result.message,
      data: result
    });
  } catch (error) {
    console.error('Admin manual fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running manual fetch',
      error: error.message
    });
  }
});

/**
 * Admin: Add manual review
 * @route POST /api/admin/reviews
 */
router.post('/admin/reviews', authenticateAdmin, async (req, res) => {
  try {
    const { authorName, rating, text, reviewTime } = req.body;
    
    if (!authorName || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: authorName, rating, text'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await reviewService.addManualReview({
      authorName,
      rating,
      text,
      reviewTime: reviewTime ? new Date(reviewTime) : new Date()
    });

    if (result.success) {
      console.log(`👤 Admin added manual review: ${authorName}`);
      res.status(201).json({
        success: true,
        message: 'Manual review added successfully',
        review: result.review
      });
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Admin add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding manual review',
      error: error.message
    });
  }
});

/**
 * Admin: Get all reviews (including hidden)
 * @route GET /api/admin/reviews
 */
router.get('/admin/reviews', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const Review = require('../models/Review');
    const reviews = await Review.find()
      .sort({ reviewTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Review.countDocuments();
    
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        ...review.toAPIResponse(),
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      })),
      total
    });

  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin reviews',
      error: error.message
    });
  }
});

/**
 * Admin: Update review status
 * @route PATCH /api/admin/reviews/:id
 */
router.patch('/admin/reviews/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, isPublic } = req.body;
    const Review = require('../models/Review');
    
    const updateData = {};
    if (status) updateData.status = status;
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    console.log(`📝 Admin updated review ${req.params.id}: ${JSON.stringify(updateData)}`);
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review: review.toAPIResponse()
    });

  } catch (error) {
    console.error('Admin update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

module.exports = router;