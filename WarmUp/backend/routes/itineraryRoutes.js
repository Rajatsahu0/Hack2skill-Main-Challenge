const express = require('express');
const router = express.Router();
const { getItinerary, chatModifyItinerary, replanItinerary } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all itinerary operations
router.use(protect);

router.route('/:tripId')
  .get(getItinerary);

router.route('/:tripId/chat')
  .post(chatModifyItinerary);

router.route('/:tripId/replan')
  .post(replanItinerary);

module.exports = router;
