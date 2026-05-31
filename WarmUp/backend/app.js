const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables from .env
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Enable Cross-Origin requests and JSON body parsers
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /\.vercel\.app$/
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all in production for now
  },
  credentials: true
}));
app.use(express.json());

// Setup API Sub-routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/notifications', notificationRoutes);

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Travel Planning Engine API is operational',
    timestamp: new Date()
  });
});

// Centralized error boundary
app.use((err, req, res, next) => {
  console.error('Unhandled server exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
