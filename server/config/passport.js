const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationHistory = require('../models/RegistrationHistory');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Only register Google strategy if real credentials are provided
const hasGoogleCreds =
  process.env.GOOGLE_CLIENT_ID &&
  !process.env.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');

if (hasGoogleCreds) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/users/auth/google/callback`
          : '/api/users/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const email = profile.emails[0].value;
            // Check registration history limit
            let history = await RegistrationHistory.findOne({ email });
            if (history && history.count >= 10) {
              return done(new Error('Registration limit reached for this email (Lifetime limit: 10)'), null);
            }

            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              if (!user.avatar) user.avatar = profile.photos[0]?.value;
              await user.save();
            } else {
              // Increment/Create history record for brand new user
              if (history) {
                history.count += 1;
                await history.save();
              } else {
                await RegistrationHistory.create({ email, count: 1 });
              }

              user = await User.create({
                name: profile.displayName,
                email,
                googleId: profile.id,
                avatar: profile.photos[0]?.value || '',
                password: 'GOOGLE_AUTH_USER_' + profile.id,
                isVerified: true,
              });
            }
          }

          const token = generateToken(user._id);
          return done(null, { user, token });
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy loaded');
} else {
  console.log('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
