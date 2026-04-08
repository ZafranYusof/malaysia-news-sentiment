const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, googleLogin, googleFirebaseLogin, verifyEmail,
  forgotPassword, resetPassword, getMe,
  updatePreferences, updateProfile, resendVerification,
} = require('../controllers/authController');

// Public
router.post('/register',            register);
router.post('/login',               login);
router.post('/google',              googleLogin);
router.post('/google-firebase',     googleFirebaseLogin);
router.get('/verify-email/:token',  verifyEmail);
router.post('/forgot-password',     forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerification);

// Dev-only: force-verify an account (uses live DB connection)
if (process.env.NODE_ENV !== 'production') {
  const User = require('../models/User');
  router.post('/dev/force-verify', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOneAndUpdate(
        { email },
        { isVerified: true, verificationToken: undefined, verificationExpires: undefined },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ message: `✅ ${email} is now verified.` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

// Protected
router.get('/me',                   protect, getMe);
router.patch('/preferences',        protect, updatePreferences);
router.patch('/profile',            protect, updateProfile);

module.exports = router;

