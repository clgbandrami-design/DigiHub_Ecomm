const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // AI Recommendation fields
    embedding: {
      type: [Number],
      default: [],
      select: false, // Don't include in normal queries (large array)
    },
    embeddingText: {
      type: String,
      default: '',
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
