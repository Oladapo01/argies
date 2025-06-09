const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Google-specific fields
  googleReviewId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  
  // Review content
  authorName: {
    type: String,
    required: true
  },
  
  authorPhotoUrl: {
    type: String,
    default: null
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  text: {
    type: String,
    required: true
  },
  
  // Timing
  reviewTime: {
    type: Date,
    required: true
  },
  
  relativeTimeDescription: {
    type: String // "2 weeks ago", "a month ago", etc.
  },
  
  // Source tracking
  source: {
    type: String,
    enum: ['google', 'manual', 'facebook', 'other'],
    default: 'google'
  },
  
  // Status for moderation
  status: {
    type: String,
    enum: ['active', 'hidden', 'pending'],
    default: 'active'
  },
  
  // Metadata
  language: {
    type: String,
    default: 'en'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance
reviewSchema.index({ status: 1, reviewTime: -1 });
reviewSchema.index({ source: 1, status: 1 });
reviewSchema.index({ googleReviewId: 1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.reviewTime.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Static method to get active reviews
reviewSchema.statics.getActiveReviews = function(limit = 20, offset = 0) {
  return this.find({ 
    status: 'active',
    isPublic: true 
  })
  .sort({ reviewTime: -1 })
  .limit(limit)
  .skip(offset);
};

// Static method to get average rating
reviewSchema.statics.getAverageRating = function() {
  return this.aggregate([
    { 
      $match: { 
        status: 'active',
        isPublic: true 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
};

// Method to convert to API response format
reviewSchema.methods.toAPIResponse = function() {
  return {
    id: this._id,
    author_name: this.authorName,
    profile_photo_url: this.authorPhotoUrl,
    rating: this.rating,
    text: this.text,
    time: this.reviewTime.getTime(),
    relative_time_description: this.relativeTimeDescription,
    source: this.source,
    formatted_date: this.formattedDate
  };
};

module.exports = mongoose.model('Review', reviewSchema);