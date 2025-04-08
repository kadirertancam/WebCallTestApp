// server/controllers/serviceAdController.js
const ServiceAd = require('../models/ServiceAd');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create a new service ad
exports.createServiceAd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, hourlyRate, serviceDetails, categories, availability } = req.body;
    
    // Check if user is a service provider
    const user = await User.findById(req.user.id);
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Only service providers can create ads' });
    }

    const newServiceAd = new ServiceAd({
      title,
      description,
      hourlyRate,
      serviceDetails,
      categories,
      availability,
      provider: req.user.id
    });

    await newServiceAd.save();

    res.status(201).json({
      message: 'Service ad created successfully',
      serviceAd: newServiceAd
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all service ads (for members)
exports.getAllServiceAds = async (req, res) => {
  try {
    const { category, minRate, maxRate, query } = req.query;
    
    // Build filter object
    let filter = { isActive: true };
    
    if (category) {
      filter.categories = { $in: [category] };
    }
    
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = parseInt(minRate);
      if (maxRate) filter.hourlyRate.$lte = parseInt(maxRate);
    }
    
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    const serviceAds = await ServiceAd.find(filter)
      .populate('provider', 'profile')
      .sort({ createdAt: -1 });
    
    res.json(serviceAds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get service ads for a specific provider
exports.getProviderServiceAds = async (req, res) => {
  try {
    const serviceAds = await ServiceAd.find({ provider: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(serviceAds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// server/controllers/serviceAdController.js
exports.searchServices = async (req, res) => {
    try {
      const { query, category, minRate, maxRate, page = 1, limit = 12 } = req.query;
      
      // Build search filter
      let filter = { isActive: true };
      
      // Add text search if query provided
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { serviceDetails: { $regex: query, $options: 'i' } }
        ];
      }
      
      // Add category filter if provided
      if (category) {
        filter.categories = { $in: [category] };
      }
      
      // Add price range filter if provided
      if (minRate || maxRate) {
        filter.hourlyRate = {};
        if (minRate) filter.hourlyRate.$gte = Number(minRate);
        if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
      }
      
      // Execute search with pagination
      const totalServices = await ServiceAd.countDocuments(filter);
      const skip = (page - 1) * limit;
      
      const services = await ServiceAd.find(filter)
        .populate('provider', 'profile')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit));
      
      // Get unique categories for filtering
      const allCategories = await ServiceAd.distinct('categories', { isActive: true });
      
      // Save search query to user history if logged in and query provided
      if (req.user && query) {
        req.user.searchHistory.push({
          term: query,
          timestamp: new Date()
        });
        
        // Keep only the 20 most recent searches
        if (req.user.searchHistory.length > 20) {
          req.user.searchHistory = req.user.searchHistory.slice(-20);
        }
        
        await req.user.save();
      }
      
      res.json({
        success: true,
        count: services.length,
        total: totalServices,
        pages: Math.ceil(totalServices / limit),
        currentPage: page,
        categories: allCategories,
        data: services
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
exports.createServiceAd = async (req, res) => {
    try {
      const { title, description, hourlyRate, serviceDetails, categories, availability } = req.body;
      
      // Validate required fields
      if (!title || !description || !hourlyRate || !serviceDetails || !categories) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const newService = new ServiceAd({
        title,
        description,
        hourlyRate: Number(hourlyRate),
        serviceDetails,
        categories,
        availability: availability || [],
        provider: req.user.id,
        isActive: true
      });
      
      await newService.save();
      
      res.status(201).json({
        success: true,
        data: newService
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
// Update a service ad
exports.updateServiceAd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, hourlyRate, serviceDetails, categories, availability, isActive } = req.body;
    
    // Find service ad and check ownership
    const serviceAd = await ServiceAd.findById(id);
    
    if (!serviceAd) {
      return res.status(404).json({ message: 'Service ad not found' });
    }
    
    if (serviceAd.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this ad' });
    }
    
    // Update fields
    if (title) serviceAd.title = title;
    if (description) serviceAd.description = description;
    if (hourlyRate) serviceAd.hourlyRate = hourlyRate;
    if (serviceDetails) serviceAd.serviceDetails = serviceDetails;
    if (categories) serviceAd.categories = categories;
    if (availability) serviceAd.availability = availability;
    if (isActive !== undefined) serviceAd.isActive = isActive;
    
    await serviceAd.save();
    
    res.json({
      message: 'Service ad updated successfully',
      serviceAd
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};