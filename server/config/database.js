// server/config/database.js
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      logger.error(`MongoDB connection error: ${err.message}`);
      
      if (retries < maxRetries) {
        retries++;
        logger.info(`Retrying connection (${retries}/${maxRetries})...`);
        // Exponential backoff
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return connect();
      } else {
        process.exit(1);
      }
    }
  };
  
  return connect();
};

module.exports = connectDB;