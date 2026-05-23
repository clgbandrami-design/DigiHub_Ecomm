const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationHistory = require('../models/RegistrationHistory');
const { sendEmailOTP } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  isSeller: user.isSeller,
  sellerInfo: user.sellerInfo,
  avatar: user.avatar,
  token,
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json(formatUser(user, generateToken(user._id)));
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  const userExists = await User.findOne({ email });
  
  // Check registration history limit
  let history = await RegistrationHistory.findOne({ email });
  if (history && history.count >= 10) {
    res.status(403).json({ message: 'Registration limit reached for this email (Lifetime limit: 10)' });
    return;
  }

  if (userExists) {
    if (userExists.isVerified) {
      res.status(400).json({ 
        message: 'An account with this email already exists. Please login instead.',
        redirectToLogin: true
      });
      return;
    }
    // Not verified yet — auto verify them now
    userExists.name = name;
    userExists.password = password;
    userExists.isVerified = true;
    userExists.emailOtp = undefined;
    userExists.emailOtpExpires = undefined;
    await userExists.save();
    
    res.status(201).json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      isAdmin: userExists.isAdmin,
      isVerified: userExists.isVerified,
      token: generateToken(userExists._id),
    });
    return;
  }

  // Increment/Create history record
  if (history) {
    history.count += 1;
    await history.save();
  } else {
    await RegistrationHistory.create({ email, count: 1 });
  }

  const user = await User.create({
    name,
    email,
    password,
    isVerified: true,
    isAdmin: email.toLowerCase() === 'clgbandrami@gmail.com',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json(formatUser(user, null));
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Google OAuth callback — issue JWT and redirect to frontend
// @route   GET /api/users/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  const { user, token } = req.user; // set by passport strategy
  const userData = encodeURIComponent(JSON.stringify(formatUser(user, token)));
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&user=${userData}`);
};

// @desc    Verify Email OTP
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    const token = generateToken(user._id);
    return res.json(formatUser(user, token));
  }

  if (user.emailOtp === otp && user.emailOtpExpires > Date.now()) {
    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();
    console.log(`✅ Email verified for ${email}`);

    const token = generateToken(user._id);
    res.json(formatUser(user, token));
  } else {
    console.log(`❌ Invalid or expired OTP attempt for ${email}: "${otp}" (Expected: "${user.emailOtp}")`);
    res.status(400).json({ message: 'Invalid or expired OTP' });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/users/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(200).json({ message: 'Email already verified. Please login.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailOtp = otp;
  user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmailOTP(email, otp);
  console.log(`🔄 OTP resent to ${email}`);
  res.json({ message: 'OTP resent successfully' });
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User account deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { authUser, registerUser, getUserProfile, googleCallback, verifyEmail, resendOTP, deleteUserAccount };
