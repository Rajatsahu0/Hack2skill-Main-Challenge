const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  // Map allows dynamic keys like 'day1', 'day2' mapping to their morning/afternoon/evening details
  days: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  history: [
    {
      updatedAt: {
        type: Date,
        default: Date.now
      },
      reason: {
        type: String,
        required: true
      },
      previousDays: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', ItinerarySchema);
