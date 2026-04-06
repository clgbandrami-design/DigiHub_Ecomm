const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

// Public — frontend needs the key to open Razorpay popup
router.get('/key', getRazorpayKey);

// Protected — user must be logged in
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Webhook — called by Razorpay servers (no auth, uses signature)
router.post('/webhook', handleWebhook);

module.exports = router;
