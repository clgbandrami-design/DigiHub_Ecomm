const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  becomeSeller,
  getSellerAnalytics,
} = require('../controllers/sellerController');

// All routes are protected
router.use(protect);

router.put('/become-seller', becomeSeller);
router.get('/analytics', getSellerAnalytics);
router.get('/my-products', getMyProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
