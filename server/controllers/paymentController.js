const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expected === signature;
};

const grantPurchasedProducts = async (order) => {
  if (!order?.user || !order?.orderItems?.length) return;

  const purchasedIds = order.orderItems
    .map((item) => item.product?.toString())
    .filter(Boolean);

  if (!purchasedIds.length) return;

  await User.findByIdAndUpdate(order.user, {
    $addToSet: { purchasedProducts: { $each: purchasedIds } },
  });
};

// @desc    Get Razorpay public key
// @route   GET /api/payment/key
// @access  Public
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const numericTotalAmount = Number(totalAmount);
    if (!Number.isFinite(numericTotalAmount) || numericTotalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const productIds = items.map((item) => item._id || item.product).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).select(
      'name image price fileUrl'
    );
    const productMap = new Map(dbProducts.map((product) => [product._id.toString(), product]));

    if (productMap.size !== productIds.length) {
      return res.status(400).json({ message: 'One or more products no longer exist' });
    }

    const amountInPaise = Math.round(numericTotalAmount * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    });

    const orderItems = items.map((item) => {
      const productId = (item._id || item.product).toString();
      const product = productMap.get(productId);
      const qty = Number(item.qty) || 1;
      const unitPriceInInr = Math.round(Number(product.price) * 86);

      return {
        name: product.name,
        qty,
        image: product.image,
        price: unitPriceInInr * qty,
        fileUrl: product.fileUrl,
        product: product._id,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice: numericTotalAmount,
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
    console.error('Create Order Error:', error);
    const errorMessage = error.error?.description || error.message || JSON.stringify(error);
    res.status(500).json({ message: `Failed to create order: ${errorMessage}` });
  }
};

// @desc    Verify payment signature after Razorpay checkout
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      await Order.findOneAndUpdate(
        { razorpay_order_id },
        { status: 'failed', downloadReady: false }
      );
      return res
        .status(400)
        .json({ success: false, message: 'Payment verification failed due to invalid signature' });
    }

    const order = await Order.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        isPaid: true,
        downloadReady: true,
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

    await grantPurchasedProducts(order);
    console.log(`Payment verified: ${razorpay_payment_id} for order ${order._id}`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// @desc    Handle Razorpay webhooks
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Webhook signature mismatch. Ignoring event.');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const { event: eventName, payload } = event;
    console.log(`Razorpay Webhook: ${eventName}`);

    switch (eventName) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const order = await Order.findOneAndUpdate(
          { razorpay_order_id: payment.order_id },
          {
            razorpay_payment_id: payment.id,
            status: 'paid',
            isPaid: true,
            downloadReady: true,
            paidAt: new Date(),
            paymentResult: {
              id: payment.id,
              status: 'captured',
              update_time: new Date().toISOString(),
            },
          },
          { new: true }
        );

        if (order) {
          await grantPurchasedProducts(order);
          console.log(`Order ${order._id} marked as paid via webhook`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const order = await Order.findOneAndUpdate(
          { razorpay_order_id: payment.order_id },
          { status: 'failed', downloadReady: false },
          { new: true }
        );

        if (order) {
          console.log(`Order ${order._id} marked as failed via webhook`);
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(200).json({ status: 'error' });
  }
};

module.exports = {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  handleWebhook,
};
