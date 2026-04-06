const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google OAuth users
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    sellerInfo: {
      storeName: { type: String, default: '' },
      description: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailOtp: {
      type: String,
    },
    emailOtpExpires: {
      type: Date,
    },
    purchasedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  // Don't re-hash Google OAuth placeholder passwords
  if (this.password.startsWith('GOOGLE_AUTH_USER_')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
