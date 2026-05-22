const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getMyDownloads,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const { downloadInvoice } = require('../controllers/invoiceController');

router.post('/', protect, addOrderItems);
router.get('/downloads', protect, getMyDownloads);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoice);
router.put('/:id/pay', protect, updateOrderToPaid);

module.exports = router;
