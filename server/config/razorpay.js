const Razorpay = require('razorpay');

/**
 * Singleton Razorpay instance.
 * Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from env.
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
