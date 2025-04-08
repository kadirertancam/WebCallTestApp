// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const redis = require('redis');
const session = require('express-session');
const dotenv = require('dotenv');

// connect-redis 5.x, CommonJS kullanımı:
const RedisStore = require('connect-redis')(session);

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

let redisClient;
let redisStore;

const connectRedis = async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => {
    console.error('Redis bağlantı hatası:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis\'e bağlandı');
  });

  await redisClient.connect();

  redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:'
  });
};

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI ||
      'mongodb://myapp_mongo_user:strong_mongo_password_123@localhost:27017/myapp_mongo_db?authSource=admin';
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB bağlandı');
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  await connectRedis();

  // Middleware'ler
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET || 'your_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 hafta
      }
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes (CommonJS ile içe aktarılıyor)
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/services', require('./routes/serviceRoutes'));
  app.use('/api/calls', require('./routes/callRoutes'));
  app.use('/api/coins', require('./routes/coinRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));

  app.use(morgan('dev'));

  // Hata yakalama middleware'i
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Internal Server Error'
    });
  });
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Health check ve Root route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.get('/', (req, res) => {
    res.send('Marketplace API çalışıyor');
  });

  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
  });
})();

module.exports = app;
