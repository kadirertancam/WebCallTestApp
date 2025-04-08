// server/services/paymentService.js
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { AppError } = require('../utils/errorHandler');
const logger = require('../config/logger');

class PaymentService {
  // Process Stripe payment
  async processStripePayment(userId, packageId, paymentMethodId) {
    try {
      // Get coin package
      const package = this.getCoinPackage(packageId);
      if (!package) {
        throw new AppError('Invalid package ID', 400);
      }
      
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Initialize Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(package.price * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.CLIENT_URL}/member/coins/confirmation`,
      });
      
      if (paymentIntent.status !== 'succeeded') {
        throw new AppError('Payment failed', 400);
      }
      
      // Create transaction record
      const transaction = await this.createTransactionRecord(
        userId,
        'purchase',
        package.price,
        package.coins,
        'stripe',
        'completed',
        { stripePaymentIntentId: paymentIntent.id }
      );
      
      // Update user's coin balance
      user.coins += package.coins;
      await user.save();
      
      return {
        success: true,
        transaction,
        newBalance: user.coins
      };
    } catch (error) {
      logger.error(`Stripe payment error: ${error.message}`);
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
  
  // Process PayPal payment
  async processPaypalPayment(userId, packageId, orderId) {
    try {
      // Get coin package
      const package = this.getCoinPackage(packageId);
      if (!package) {
        throw new AppError('Invalid package ID', 400);
      }
      
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Verify PayPal order
      const { data } = await axios.get(
        `https://api.paypal.com/v2/checkout/orders/${orderId}`,
        {
          auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
          }
        }
      );
      
      if (data.status !== 'COMPLETED') {
        throw new AppError('PayPal payment not completed', 400);
      }
      
      // Verify payment amount
      const paymentAmount = parseFloat(data.purchase_units[0].amount.value);
      if (paymentAmount !== package.price) {
        throw new AppError('Payment amount does not match package price', 400);
      }
      
      // Create transaction record
      const transaction = await this.createTransactionRecord(
        userId,
        'purchase',
        package.price,
        package.coins,
        'paypal',
        'completed',
        { paypalOrderId: orderId }
      );
      
      // Update user's coin balance
      user.coins += package.coins;
      await user.save();
      
      return {
        success: true,
        transaction,
        newBalance: user.coins
      };
    } catch (error) {
      logger.error(`PayPal payment error: ${error.message}`);
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
  
  // Create transaction record
  async createTransactionRecord(userId, type, amount, coins, paymentMethod, status, details = {}) {
    const transaction = new Transaction({
      user: userId,
      type,
      amount,
      coins,
      paymentMethod,
      status,
      details
    });
    
    await transaction.save();
    return transaction;
  }
  
  // Get coin package details
  getCoinPackage(packageId) {
    const packages = [
      { id: '1', name: 'Starter', coins: 100, price: 9.99 },
      { id: '2', name: 'Plus', coins: 500, price: 39.99 },
      { id: '3', name: 'Pro', coins: 1000, price: 69.99 },
      { id: '4', name: 'Enterprise', coins: 5000, price: 299.99 }
    ];
    
    return packages.find(p => p.id === packageId);
  }
  
  // Get available coin packages
  getAvailablePackages() {
    return [
      { id: '1', name: 'Starter', coins: 100, price: 9.99 },
      { id: '2', name: 'Plus', coins: 500, price: 39.99 },
      { id: '3', name: 'Pro', coins: 1000, price: 69.99 },
      { id: '4', name: 'Enterprise', coins: 5000, price: 299.99 }
    ];
  }
}

module.exports = new PaymentService();