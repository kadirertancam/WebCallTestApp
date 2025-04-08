// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

// Generate tokens
const generateTokens = (userId, role) => {
  // Access token - short lived
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
  
  // Refresh token - longer lived
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role: role || 'member',
      profile: profile || {
        firstName: '',
        lastName: ''
      },
      isVerified: role === 'admin' // Only admins auto-verified for demo
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        coins: user.coins,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
// server/controllers/authController.js

exports.getCurrentUser = (req, res) => {
  // Ensure that req.user exists and contains the expected data from the protect middleware
  if (!req.user) {
    return res.status(401).json({ message: 'No user information found' });
  }
  res.status(200).json({
    message: 'User found',
    user: req.user
  });
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token to user if "remember me" is checked
    if (rememberMe) {
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for remember me
      });
    } else {
      // Shorter cookie lifetime if not "remember me"
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
    }

    res.json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        coins: user.coins,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user with matching refresh token
    const user = await User.findOne({ 
      _id: decoded.id,
      refreshToken
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        coins: user.coins,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    next(new AppError(error.message, 500));
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // If user is logged in, clear refresh token in database
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};