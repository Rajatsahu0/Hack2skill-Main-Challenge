const express = require('express');
const router = express.Router();
const { createTrip, getTrips, getTripById } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { getWeather } = require('../services/weatherService');

// Apply protection to all endpoints in this router
router.use(protect);

router.get('/weather/check', async (req, res) => {
  try {
    if (!req.query.city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }
    const data = await getWeather(req.query.city);
    return res.status(200).json({ success: true, weather: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/')
  .post(createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTripById);

module.exports = router;
