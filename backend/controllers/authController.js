const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { sendVerificationEmail, sendResetEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── REGISTER ──────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required.' });
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone number is required.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    // Check existing
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    if (phone) {
      const existing = await User.findOne({ phone });
      if (existing) return res.status(409).json({ error: 'An account with this phone number already exists.' });
    }

    const user = new User({ name, email, phone, password, provider: 'local' });
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email if email provided
    if (email) {
      try {
        await sendVerificationEmail(user, verificationToken);
      } catch (emailErr) {
        console.error('Email send failed (non-fatal):', emailErr.message);
      }
    }

    res.status(201).json({
      message: email
        ? `Registration successful! A verification link has been sent to ${email}.`
        : 'Registration successful! Please log in.',
      requiresVerification: !!email,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ── LOGIN ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required.' });
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    if (!user.isVerified && user.email) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', unverified: true });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        provider: user.provider,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── GOOGLE LOGIN ─────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing.' });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google login is not configured on this server.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture, provider: 'google', isVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      user.isVerified = true;
      if (picture) user.avatar = picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, provider: user.provider, preferences: user.preferences },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(401).json({ error: 'Google authentication failed.' });
  }
};

// ── FIREBASE GOOGLE LOGIN ─────────────────────────────────────
// This is the bridge for modern Firebase-based login
const googleFirebaseLogin = async (req, res) => {
  try {
    const { token, name, email, picture } = req.body;
    
    // Note: In production, you MUST use 'firebase-admin' to verify this token!
    if (!token || !email) {
      return res.status(400).json({ error: 'Auth token or email missing.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ 
        name: name || 'Google User', 
        email, 
        avatar: picture, 
        provider: 'google', 
        isVerified: true 
      });
    } else {
      user.provider = 'google';
      user.isVerified = true;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    const localToken = signToken(user._id);
    res.json({
      token: localToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        role: user.role, 
        provider: user.provider, 
        preferences: user.preferences 
      },
    });
  } catch (err) {
    console.error('Firebase bridge error:', err.message);
    res.status(500).json({ error: 'Failed to synchronize with backend.' });
  }
};

// ── VERIFY EMAIL ─────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Verification link is invalid or has expired.' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Email verified successfully! You are now logged in.', token, user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user || user.provider === 'google') {
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendResetEmail(user, resetToken);
    } catch (emailErr) {
      user.resetToken = undefined;
      user.resetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    const jwtToken = signToken(user._id);
    res.json({ message: 'Password reset successful!', token: jwtToken, user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

// ── GET ME ────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role, provider: user.provider, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// ── UPDATE PREFERENCES ────────────────────────────────────────
const updatePreferences = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Merge preferences
    Object.assign(user.preferences, updates);
    await user.save();

    res.json({ message: 'Preferences updated.', preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
};

// ── UPDATE PROFILE ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();

    res.json({ 
      message: 'Profile updated.', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        avatar: user.avatar 
      } 
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// ── RESEND VERIFICATION ────────────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.json({ message: 'If this email is registered and unverified, a new link has been sent.' });
    }

    const token = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, token);

    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend verification.' });
  }
};

module.exports = { register, login, googleLogin, googleFirebaseLogin, verifyEmail, forgotPassword, resetPassword, getMe, updatePreferences, updateProfile, resendVerification };
