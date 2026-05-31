const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Notification = require('../models/Notification');
const { generateItinerary } = require('../services/openaiService');
const { sendNotification } = require('../sockets/socketHandler');

// @desc    Create a new trip & generate itinerary
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, travelStyle, interests, pace, constraints } = req.body;

    if (!destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ success: false, message: 'Please provide destination, start date, end date, and budget' });
    }

    // 1. Create Trip Document
    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      startDate,
      endDate,
      budget,
      travelers: travelers || 1,
      travelStyle: travelStyle || 'Adventure',
      interests: interests || [],
      pace: pace || 'Moderate',
      constraints: constraints || ''
    });

    // 2. Generate AI Itinerary
    const days = await generateItinerary({
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      travelStyle,
      interests,
      pace,
      constraints
    });

    // 3. Create Itinerary Document
    const itinerary = await Itinerary.create({
      tripId: trip._id,
      days
    });

    // 4. Create Notification Log
    const notificationMsg = `Your custom itinerary for ${destination} is ready!`;
    const notification = await Notification.create({
      userId: req.user.id,
      message: notificationMsg,
      type: 'general'
    });

    // 5. Emit Real-time Socket Event
    sendNotification(req.user.id, 'general', notificationMsg, { tripId: trip._id });

    return res.status(201).json({
      success: true,
      trip,
      itinerary
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort('-createdAt');
    return res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    const itinerary = await Itinerary.findOne({ tripId: trip._id });

    return res.status(200).json({
      success: true,
      trip,
      itinerary
    });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById
};
