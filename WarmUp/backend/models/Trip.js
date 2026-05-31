const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  travelers: {
    type: Number,
    required: [true, 'Please add the number of travelers'],
    default: 1
  },
  travelStyle: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  pace: {
    type: String,
    default: 'Moderate'
  },
  constraints: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
