const express = require('express');
const router = express.Router();
const { createTrip, getTrips, getTripById } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { getWeather } = require('../services/weatherService');

// Apply protection to all endpoints in this router
router.use(protect);

// Trending destinations by current month/season
router.get('/trending', (req, res) => {
  const month = new Date().getMonth(); // 0-11

  // Season-based trending destinations
  const trendingByMonth = {
    // Winter (Dec, Jan, Feb) - months 11, 0, 1
    winter: [
      { destination: 'Goa', country: 'India', image: '🏖️', tagline: 'Sun, sand & seafood', avgBudget: 25000, bestFor: ['Beach', 'Nightlife', 'Food'] },
      { destination: 'Jaipur', country: 'India', image: '🏰', tagline: 'Royal heritage in pleasant weather', avgBudget: 20000, bestFor: ['History', 'Culture', 'Shopping'] },
      { destination: 'Dubai', country: 'UAE', image: '🌇', tagline: 'Luxury shopping & desert adventures', avgBudget: 80000, bestFor: ['Shopping', 'Adventure', 'Luxury'] },
      { destination: 'Manali', country: 'India', image: '🏔️', tagline: 'Snow-capped mountains & cozy vibes', avgBudget: 15000, bestFor: ['Adventure', 'Nature', 'Snow'] },
      { destination: 'Udaipur', country: 'India', image: '🕌', tagline: 'City of lakes & palaces', avgBudget: 18000, bestFor: ['Culture', 'Romance', 'History'] },
      { destination: 'Thailand', country: 'Thailand', image: '🌴', tagline: 'Tropical beaches & street food', avgBudget: 45000, bestFor: ['Beach', 'Food', 'Nightlife'] }
    ],
    // Spring (Mar, Apr, May) - months 2, 3, 4
    spring: [
      { destination: 'Shimla', country: 'India', image: '🌸', tagline: 'Cherry blossoms & hill station charm', avgBudget: 12000, bestFor: ['Nature', 'Romance', 'Relaxation'] },
      { destination: 'Munnar', country: 'India', image: '🍃', tagline: 'Tea gardens & misty mornings', avgBudget: 15000, bestFor: ['Nature', 'Relaxation', 'Photography'] },
      { destination: 'Darjeeling', country: 'India', image: '🚂', tagline: 'Toy trains & tea estates', avgBudget: 14000, bestFor: ['Nature', 'Culture', 'Food'] },
      { destination: 'Rishikesh', country: 'India', image: '🧘', tagline: 'Yoga, rafting & spiritual vibes', avgBudget: 10000, bestFor: ['Adventure', 'Spirituality', 'Nature'] },
      { destination: 'Japan', country: 'Japan', image: '🌸', tagline: 'Cherry blossom season magic', avgBudget: 120000, bestFor: ['Culture', 'Food', 'Photography'] },
      { destination: 'Ooty', country: 'India', image: '🌿', tagline: 'Queen of hill stations', avgBudget: 12000, bestFor: ['Nature', 'Romance', 'Relaxation'] }
    ],
    // Summer (Jun, Jul, Aug) - months 5, 6, 7
    summer: [
      { destination: 'Ladakh', country: 'India', image: '🏔️', tagline: 'High-altitude desert & monasteries', avgBudget: 35000, bestFor: ['Adventure', 'Nature', 'Photography'] },
      { destination: 'Meghalaya', country: 'India', image: '🌧️', tagline: 'Living root bridges & waterfalls', avgBudget: 20000, bestFor: ['Nature', 'Adventure', 'Culture'] },
      { destination: 'Bali', country: 'Indonesia', image: '🌺', tagline: 'Temples, rice terraces & surf', avgBudget: 55000, bestFor: ['Beach', 'Culture', 'Adventure'] },
      { destination: 'Switzerland', country: 'Switzerland', image: '⛰️', tagline: 'Alpine meadows & scenic trains', avgBudget: 150000, bestFor: ['Nature', 'Adventure', 'Luxury'] },
      { destination: 'Coorg', country: 'India', image: '☕', tagline: 'Coffee plantations & misty hills', avgBudget: 12000, bestFor: ['Nature', 'Relaxation', 'Food'] },
      { destination: 'Spiti Valley', country: 'India', image: '🏜️', tagline: 'Barren beauty & stargazing', avgBudget: 25000, bestFor: ['Adventure', 'Photography', 'Nature'] }
    ],
    // Autumn (Sep, Oct, Nov) - months 8, 9, 10
    autumn: [
      { destination: 'Kerala', country: 'India', image: '🛶', tagline: 'Backwaters & Ayurveda retreats', avgBudget: 22000, bestFor: ['Relaxation', 'Nature', 'Food'] },
      { destination: 'Varanasi', country: 'India', image: '🪔', tagline: 'Spiritual ghats & Diwali vibes', avgBudget: 10000, bestFor: ['Spirituality', 'Culture', 'Food'] },
      { destination: 'Hampi', country: 'India', image: '🏛️', tagline: 'Ancient ruins & boulder landscapes', avgBudget: 8000, bestFor: ['History', 'Photography', 'Culture'] },
      { destination: 'Paris', country: 'France', image: '🗼', tagline: 'Autumn leaves along the Seine', avgBudget: 100000, bestFor: ['Culture', 'Food', 'Romance'] },
      { destination: 'Rajasthan', country: 'India', image: '🐪', tagline: 'Desert festivals & fort stays', avgBudget: 25000, bestFor: ['Culture', 'History', 'Adventure'] },
      { destination: 'Andaman', country: 'India', image: '🐚', tagline: 'Crystal waters & coral reefs', avgBudget: 30000, bestFor: ['Beach', 'Adventure', 'Nature'] }
    ]
  };

  let season;
  if (month === 11 || month === 0 || month === 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'autumn';

  const seasonNames = { winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' };

  return res.status(200).json({
    success: true,
    season: seasonNames[season],
    destinations: trendingByMonth[season]
  });
});

// Travel options between cities with estimated costs
router.post('/travel-options', (req, res) => {
  const { fromCity, toCity, travelers } = req.body;
  
  if (!fromCity || !toCity) {
    return res.status(400).json({ success: false, message: 'fromCity and toCity are required' });
  }

  const numTravelers = travelers || 1;

  // Distance estimation based on city pairs (simplified)
  const cityDistances = {
    'delhi-goa': 1900, 'delhi-bengaluru': 2150, 'delhi-mumbai': 1400, 'delhi-jaipur': 280,
    'delhi-shimla': 350, 'delhi-manali': 540, 'delhi-udaipur': 660, 'delhi-varanasi': 820,
    'delhi-kolkata': 1500, 'delhi-chennai': 2180, 'delhi-ladakh': 1000, 'delhi-rishikesh': 250,
    'mumbai-goa': 590, 'mumbai-bengaluru': 980, 'mumbai-delhi': 1400, 'mumbai-jaipur': 1150,
    'mumbai-pune': 150, 'mumbai-udaipur': 660, 'mumbai-chennai': 1330, 'mumbai-kolkata': 2050,
    'bengaluru-goa': 560, 'bengaluru-mumbai': 980, 'bengaluru-chennai': 350, 'bengaluru-delhi': 2150,
    'bengaluru-ooty': 270, 'bengaluru-coorg': 250, 'bengaluru-hampi': 340, 'bengaluru-munnar': 470,
    'bengaluru-kerala': 550, 'bengaluru-hyderabad': 570,
    'kolkata-darjeeling': 600, 'kolkata-delhi': 1500, 'kolkata-bengaluru': 1870,
    'chennai-bengaluru': 350, 'chennai-mumbai': 1330, 'chennai-delhi': 2180, 'chennai-ooty': 560,
    'hyderabad-goa': 630, 'hyderabad-bengaluru': 570, 'hyderabad-mumbai': 710,
    'pune-goa': 450, 'pune-mumbai': 150, 'pune-bengaluru': 840
  };

  const from = fromCity.toLowerCase().trim();
  const to = toCity.toLowerCase().trim();
  
  // Try both directions
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  let distance = cityDistances[key1] || cityDistances[key2] || null;
  
  // If not found, estimate based on generic distance
  if (!distance) {
    // Random but deterministic estimate based on string lengths
    distance = Math.abs((from.length * 137 + to.length * 89) % 2000) + 200;
  }

  // Cost estimation per person
  const trainCostPerKm = 1.2; // ₹ per km (Sleeper/AC3)
  const busCostPerKm = 1.5;   // ₹ per km (AC bus)
  const flightBase = 3000;     // Base flight cost
  const flightPerKm = 3.5;    // ₹ per km for flights

  const trainCost = Math.round(distance * trainCostPerKm);
  const busCost = Math.round(distance * busCostPerKm);
  const flightCost = Math.round(flightBase + distance * flightPerKm);

  // Duration estimation
  const trainSpeed = 55; // km/h average
  const busSpeed = 45;
  const flightSpeed = 600;

  const trainHours = Math.round(distance / trainSpeed);
  const busHours = Math.round(distance / busSpeed);
  const flightHours = Math.max(1, Math.round((distance / flightSpeed) + 1.5)); // +1.5 for boarding/transit

  const options = [
    {
      mode: 'train',
      icon: '🚂',
      label: 'Train',
      costPerPerson: trainCost,
      totalCost: trainCost * numTravelers,
      duration: trainHours >= 24 ? `${Math.round(trainHours / 24)}d ${trainHours % 24}h` : `${trainHours}h`,
      durationHours: trainHours,
      comfort: distance > 1000 ? 'AC 3-Tier / AC 2-Tier' : 'AC Chair Car / Sleeper',
      note: distance > 1500 ? 'Overnight journey recommended' : 'Day travel possible'
    },
    {
      mode: 'bus',
      icon: '🚌',
      label: 'Bus',
      costPerPerson: busCost,
      totalCost: busCost * numTravelers,
      duration: busHours >= 24 ? `${Math.round(busHours / 24)}d ${busHours % 24}h` : `${busHours}h`,
      durationHours: busHours,
      comfort: distance > 500 ? 'Volvo AC Sleeper' : 'AC Semi-Sleeper',
      note: distance > 800 ? 'Consider overnight bus' : 'Comfortable day journey'
    },
    {
      mode: 'flight',
      icon: '✈️',
      label: 'Flight',
      costPerPerson: flightCost,
      totalCost: flightCost * numTravelers,
      duration: `${flightHours}h`,
      durationHours: flightHours,
      comfort: 'Economy Class',
      note: distance < 300 ? 'Short hop — train may be better value' : 'Fastest option'
    }
  ];

  return res.status(200).json({
    success: true,
    fromCity,
    toCity,
    distance: `~${distance} km`,
    travelers: numTravelers,
    options
  });
});

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
