const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllProductsAdmin,
  deleteProductAdmin,
  getStats,
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProductsAdmin);
router.delete('/products/:id', deleteProductAdmin);

module.exports = router;
