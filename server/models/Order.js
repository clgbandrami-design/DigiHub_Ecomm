const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        fileUrl: { type: String, default: '' },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    // ── Amount ──
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // ── Razorpay fields ──
    razorpay_order_id: {
      type: String,
      default: '',
    },
    razorpay_payment_id: {
      type: String,
      default: '',
    },
    razorpay_signature: {
      type: String,
      default: '',
    },

    // ── Payment status ──
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    downloadReady: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },

    // ── Legacy fields (kept for backward compat) ──
    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient webhook lookup
orderSchema.index({ razorpay_order_id: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
