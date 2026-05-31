const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');
const { modifyItinerary, replanForWeather } = require('../services/openaiService');
const { getWeather } = require('../services/weatherService');
const { sendNotification } = require('../sockets/socketHandler');

// @desc    Get itinerary by trip ID
// @route   GET /api/itineraries/:tripId
// @access  Private
const getItinerary = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found for this trip' });
    }

    return res.status(200).json({
      success: true,
      itinerary
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Modify itinerary via AI Assistant Chat
// @route   POST /api/itineraries/:tripId/chat
// @access  Private
const chatModifyItinerary = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a chat message' });
    }

    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // 1. Send modifications to OpenAI Service
    const { days: updatedDays, message: aiResponse } = await modifyItinerary(
      itinerary.days,
      message,
      trip.destination
    );

    // 2. Save history of the old state
    itinerary.history.push({
      reason: `AI Chat Command: "${message}"`,
      previousDays: itinerary.days
    });

    // 3. Update days
    itinerary.days = updatedDays;
    await itinerary.save();

    // 4. Create and emit notifications
    const notificationMsg = `AI Assistant updated your trip schedule: "${aiResponse}"`;
    await Notification.create({
      userId: req.user.id,
      message: notificationMsg,
      type: 'itinerary_updated'
    });

    sendNotification(req.user.id, 'itinerary_updated', notificationMsg, { tripId: trip._id });

    return res.status(200).json({
      success: true,
      itinerary,
      aiResponse
    });
  } catch (error) {
    console.error('Error modifying itinerary via chat:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Replan itinerary based on weather alerts (supports live/simulated weather alerts)
// @route   POST /api/itineraries/:tripId/replan
// @access  Private
const replanItinerary = async (req, res) => {
  try {
    const { simulateCondition } = req.body; // e.g. "Heavy Rain", "Thunderstorm" (optional simulation)
    
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    let weather;
    if (simulateCondition) {
      // Setup mock weather details for simulation
      weather = {
        temp: 20,
        feelsLike: 18,
        condition: simulateCondition.includes('Rain') ? 'Rain' : simulateCondition,
        description: simulateCondition.toLowerCase(),
        humidity: 90,
        windSpeed: 8.5,
        isDisruptive: true
      };
    } else {
      // Query OpenWeather Service
      weather = await getWeather(trip.destination);
    }

    // If weather is not disruptive and no simulation is requested, do not modify
    if (!weather.isDisruptive && !simulateCondition) {
      return res.status(200).json({
        success: true,
        disrupted: false,
        weather,
        message: 'Weather looks clear! No replanning needed.'
      });
    }

    // Trigger Socket.IO weather alert immediately before starting OpenAI call
    const alertMsg = `Weather alert detected for ${trip.destination}: ${weather.condition} (${weather.description}).`;
    await Notification.create({
      userId: req.user.id,
      message: alertMsg,
      type: 'weather_alert'
    });
    sendNotification(req.user.id, 'weather_alert', alertMsg, { tripId: trip._id, weather });

    // Call OpenAI weather replanning service
    const replannedDays = await replanForWeather(
      itinerary.days,
      weather.description,
      trip.destination
    );

    // Save history
    itinerary.history.push({
      reason: `Weather Replanning: ${weather.condition} (${weather.description})`,
      previousDays: itinerary.days
    });

    // Update days
    itinerary.days = replannedDays;
    await itinerary.save();

    // Create itinerary update notification
    const updateMsg = `Your itinerary for ${trip.destination} has been dynamically updated to prioritize indoor activities due to ${weather.condition}.`;
    await Notification.create({
      userId: req.user.id,
      message: updateMsg,
      type: 'itinerary_updated'
    });
    sendNotification(req.user.id, 'itinerary_updated', updateMsg, { tripId: trip._id });

    return res.status(200).json({
      success: true,
      disrupted: true,
      weather,
      itinerary,
      message: updateMsg
    });
  } catch (error) {
    console.error('Error replanning itinerary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getItinerary,
  chatModifyItinerary,
  replanItinerary
};
