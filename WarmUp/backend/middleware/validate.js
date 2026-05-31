/**
 * Input sanitization middleware - prevents XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS vectors
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    });
  }
  next();
};

/**
 * Validate trip creation input
 */
const validateTrip = (req, res, next) => {
  const { destination, startDate, endDate, budget } = req.body;
  const errors = [];

  if (!destination || destination.trim().length < 2) {
    errors.push('Destination must be at least 2 characters');
  }
  if (!startDate || isNaN(Date.parse(startDate))) {
    errors.push('Valid start date is required');
  }
  if (!endDate || isNaN(Date.parse(endDate))) {
    errors.push('Valid end date is required');
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date');
  }
  if (!budget || isNaN(budget) || Number(budget) <= 0) {
    errors.push('Budget must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

/**
 * Validate registration input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

module.exports = { sanitizeInput, validateTrip, validateRegister };
