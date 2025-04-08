// server/controllers/userController.js
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

// Comment out this line to remove the cloudinary dependency
// const cloudinary = require('../config/cloudinary');

// Get current user's profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, bio, address, settings } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile fields
    if (!user.profile) user.profile = {};
    
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phoneNumber) user.profile.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    
    // Update address if provided
    if (address) {
      if (!user.profile.address) user.profile.address = {};
      
      if (address.street) user.profile.address.street = address.street;
      if (address.city) user.profile.address.city = address.city;
      if (address.state) user.profile.address.state = address.state;
      if (address.zipCode) user.profile.address.zipCode = address.zipCode;
      if (address.country) user.profile.address.country = address.country;
    }
    
    // Update settings if provided
    if (settings) {
      if (!user.profile.settings) user.profile.settings = {};
      
      if (settings.emailNotifications !== undefined) {
        user.profile.settings.emailNotifications = settings.emailNotifications;
      }
      if (settings.smsNotifications !== undefined) {
        user.profile.settings.smsNotifications = settings.smsNotifications;
      }
      if (settings.callReminders !== undefined) {
        user.profile.settings.callReminders = settings.callReminders;
      }
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Simplified uploadProfileImage without cloudinary
exports.uploadProfileImage = async (req, res) => {
  try {
    // For now, just save a placeholder URL
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.profile) user.profile = {};
    // Use a placeholder URL
    user.profile.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile.firstName || '')}+${encodeURIComponent(user.profile.lastName || '')}&background=random`;
    
    await user.save();
    
    res.json({
      message: 'Profile image updated',
      data: {
        imageUrl: user.profile.profileImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all users - keep this if you need admin functionality
exports.getAllUsers = async (req, res) => {
  try {
    const { role, query, page = 1, limit = 10 } = req.query;
    
    // Build query
    let filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (query) {
      filter.$or = [
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await User.countDocuments(filter);
    
    // Paginate results
    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isVerified, role } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};