const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Secure notifications API with JWT validation
router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:id')
  .put(markAsRead);

module.exports = router;
