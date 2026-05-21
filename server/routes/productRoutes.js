const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controllers/productController');
const {
  getRecommendations,
  getSearchRecommendations,
} = require('../controllers/recommendationController');
const { protect, admin } = require('../middleware/authMiddleware');

// AI recommendation routes (must be before /:id to avoid route conflicts)
router.get('/ai/search-recommendations', getSearchRecommendations);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getRecommendations);
router.post('/', protect, admin, createProduct);

module.exports = router;
