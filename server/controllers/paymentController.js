const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');

// ─── Helper: verify Razorpay signature ───────────────────────────
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. GET RAZORPAY KEY (public, used by frontend)
//     GET /api/payment/key
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. CREATE ORDER
//     POST /api/payment/create-order
//     Body: { items: [...], totalAmount: Number }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Validate
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Amount in paise (INR × 100)
    const amountInPaise = Math.round(totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    });

    // Save order in MongoDB with status "pending"
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id || item.product,
      })),
      totalPrice: totalAmount,
      razorpay_order_id: razorpayOrder.id,
      status: 'pending',
      paymentMethod: 'razorpay',
    });

    res.status(201).json({
      orderId: order._id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3. VERIFY PAYMENT (called by frontend after Razorpay popup)
//     POST /api/payment/verify
//     Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature using HMAC SHA256
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Mark order as failed
      await Order.findOneAndUpdate(
        { razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // Signature valid → mark order as paid
    const order = await Order.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: razorpay_payment_id,
          status: 'captured',
          update_time: new Date().toISOString(),
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log(`✅ Payment verified: ${razorpay_payment_id} for order ${order._id}`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
    });
  } catch (error) {
    console.error('❌ Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4. WEBHOOK HANDLER (called by Razorpay servers)
//     POST /api/payment/webhook
//     NOTE: Uses raw body for signature verification.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)  // raw body string needed for HMAC
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('⚠️ Webhook signature mismatch — ignoring.');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Parse event
    const event = req.body;
    const { event: eventName, payload } = event;

    console.log(`🔔 Razorpay Webhook: ${eventName}`);

    switch (eventName) {
      // ── Payment captured (success) ──
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const order = await Order.findOneAndUpdate(
          { razorpay_order_id: payment.order_id },
          {
            razorpay_payment_id: payment.id,
            status: 'paid',
            isPaid: true,
            paidAt: new Date(),
            paymentResult: {
              id: payment.id,
              status: 'captured',
              update_time: new Date().toISOString(),
            },
          },
          { new: true }
        );
        if (order) console.log(`  ✅ Order ${order._id} marked as paid via webhook`);
        break;
      }

      // ── Payment failed ──
      case 'payment.failed': {
        const payment = payload.payment.entity;
        const order = await Order.findOneAndUpdate(
          { razorpay_order_id: payment.order_id },
          { status: 'failed' },
          { new: true }
        );
        if (order) console.log(`  ❌ Order ${order._id} marked as failed via webhook`);
        break;
      }

      default:
        console.log(`  ℹ️ Unhandled event: ${eventName}`);
    }

    // Always respond 200 to acknowledge
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    // Still respond 200 so Razorpay doesn't retry indefinitely
    res.status(200).json({ status: 'error' });
  }
};

module.exports = {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  handleWebhook,
};
