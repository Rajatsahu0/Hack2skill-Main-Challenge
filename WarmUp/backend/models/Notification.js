const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['weather_alert', 'itinerary_updated', 'general'],
    default: 'general'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
