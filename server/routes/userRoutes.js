const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  authUser,
  registerUser,
  getUserProfile,
  googleCallback,
  verifyEmail,
  resendOTP,
  deleteUserAccount,
} = require('../controllers/userController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.route('/profile').get(protect, getUserProfile).delete(protect, deleteUserAccount);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

// Google OAuth — only active when credentials are configured
const googleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  !process.env.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');

if (googleConfigured) {
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    }),
    googleCallback
  );
} else {
  router.get('/auth/google', (req, res) => {
    res.status(503).json({ message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env' });
  });
  router.get('/auth/google/callback', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_not_configured`);
  });
}

module.exports = router;
