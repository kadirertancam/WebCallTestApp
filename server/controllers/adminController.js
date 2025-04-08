// server/controllers/adminController.js
const User = require('../models/User');
const ServiceAd = require('../models/ServiceAd');
const Transaction = require('../models/Transaction');
const Call = require('../models/Call');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user counts
    const userCount = await User.countDocuments({ role: 'user' });
    const memberCount = await User.countDocuments({ role: 'member' });
    
    // Get active service ads count
    const activeAdsCount = await ServiceAd.countDocuments({ isActive: true });
    
    // Get transaction stats
    const transactions = await Transaction.find();
    const totalRevenue = transactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Get call stats
    const calls = await Call.find();
    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.status === 'completed').length;
    const totalCallMinutes = calls
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.durationMinutes || 0), 0);
    
    // Calculate average rating
    let avgRating = 0;
    const ratedCalls = calls.filter(c => c.rating);
    if (ratedCalls.length > 0) {
      avgRating = ratedCalls.reduce((sum, c) => sum + c.rating, 0) / ratedCalls.length;
    }
    
    res.json({
      users: {
        providers: userCount,
        members: memberCount,
        total: userCount + memberCount
      },
      services: {
        activeAds: activeAdsCount
      },
      financial: {
        totalRevenue,
        recentTransactions: transactions
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
      },
      calls: {
        total: totalCalls,
        completed: completedCalls,
        totalMinutes: totalCallMinutes,
        avgRating
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (paginated)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, query } = req.query;
    
    // Build filter
    let filter = {};
    if (role) filter.role = role;
    if (query) {
      filter.$or = [
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status (verify, suspend, etc.)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (!dateFilter.createdAt) dateFilter.createdAt = {};
      dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get all completed purchase transactions within date range
    const transactions = await Transaction.find({
      ...dateFilter,
      type: 'purchase',
      status: 'completed'
    });
    
    // Group by day
    const dailyRevenue = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailyRevenue[date]) dailyRevenue[date] = 0;
      dailyRevenue[date] += t.amount;
    });
    
    // Convert to array for easier client-side consumption
    const revenueData = Object.keys(dailyRevenue).map(date => ({
      date,
      amount: dailyRevenue[date]
    }));
    
    // Sort by date
    revenueData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate total
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      totalRevenue,
      dailyRevenue: revenueData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};