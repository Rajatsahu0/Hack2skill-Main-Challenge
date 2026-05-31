const { OpenAI } = require('openai');

// Initialize OpenAI client if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Predefined Mock Database for Fallback Generator
const MOCK_DESTINATIONS = {
  goa: {
    lat: 15.4909,
    lng: 73.8278,
    attractions: [
      { name: "Baga Beach", lat: 15.5539, lng: 73.7553, type: "Beach", indoor: false },
      { name: "Calangute Beach", lat: 15.5435, lng: 73.7556, type: "Beach", indoor: false },
      { name: "Fort Aguada", lat: 15.4926, lng: 73.7736, type: "History", indoor: false },
      { name: "Basilica of Bom Jesus", lat: 15.5009, lng: 73.9116, type: "Culture", indoor: true },
      { name: "Anjuna Flea Market", lat: 15.5804, lng: 73.7431, type: "Shopping", indoor: false },
      { name: "Dudhsagar Waterfalls", lat: 15.3185, lng: 74.3128, type: "Adventure", indoor: false },
      { name: "Museum of Christian Art", lat: 15.5020, lng: 73.9125, type: "Museum", indoor: true },
      { name: "Goa State Museum", lat: 15.4989, lng: 73.8210, type: "Museum", indoor: true },
      { name: "Spice Plantation Tour", lat: 15.4300, lng: 74.0200, type: "Nature", indoor: false }
    ],
    foods: ["Goan Fish Curry at Britto's", "Bebinca at Mum's Kitchen", "Prawn Balchao at Fisherman's Wharf", "Vindaloo at Martin's Corner"],
    transports: ["Scooter rental", "Tuk-tuk", "Local taxi", "Walking"]
  },
  paris: {
    lat: 48.8566,
    lng: 2.3522,
    attractions: [
      { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, type: "Sightseeing", indoor: false },
      { name: "Louvre Museum", lat: 48.8606, lng: 2.3376, type: "Museum", indoor: true },
      { name: "Notre-Dame Cathedral", lat: 48.8530, lng: 2.3499, type: "Culture", indoor: true },
      { name: "Montmartre & Sacré-Cœur", lat: 48.8867, lng: 2.3431, type: "Sightseeing", indoor: false },
      { name: "Palace of Versailles", lat: 48.8049, lng: 2.1204, type: "History", indoor: true },
      { name: "Arc de Triomphe", lat: 48.8738, lng: 2.2950, type: "Sightseeing", indoor: false },
      { name: "Musée d'Orsay", lat: 48.8599, lng: 2.3266, type: "Museum", indoor: true },
      { name: "Seine River Cruise", lat: 48.8615, lng: 2.3200, type: "Adventure", indoor: false }
    ],
    foods: ["Croissant at Du Pain et des Idées", "Escargot at L'Escargot Montorgueil", "Macarons at Ladurée", "French Onion Soup at Cafe de Flore"],
    transports: ["Metro train", "RER train", "Walking", "Public bus"]
  },
  tokyo: {
    lat: 35.6762,
    lng: 139.6503,
    attractions: [
      { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7005, type: "Sightseeing", indoor: false },
      { name: "Tokyo Skytree", lat: 35.7101, lng: 139.8107, type: "Sightseeing", indoor: true },
      { name: "Senso-ji Temple", lat: 35.7148, lng: 139.7967, type: "Culture", indoor: false },
      { name: "Meiji Shrine", lat: 35.6764, lng: 139.6993, type: "Culture", indoor: false },
      { name: "Shinjuku Gyoen National Garden", lat: 35.6852, lng: 139.7101, type: "Nature", indoor: false },
      { name: "Akihabara Electric Town", lat: 35.6984, lng: 139.7711, type: "Shopping", indoor: false },
      { name: "TeamLab Planets", lat: 35.6491, lng: 139.7911, type: "Museum", indoor: true },
      { name: "Edo-Tokyo Museum", lat: 35.6963, lng: 139.7963, type: "Museum", indoor: true }
    ],
    foods: ["Sushi at Tsukiji Outer Market", "Ramen at Ichiran Shinjuku", "Tempura at Tempura Kondo", "Yakitori at Memory Lane"],
    transports: ["Tokyo Subway", "JR Yamanote Line", "Walking", "Taxi"]
  }
};

// Catch-all generic destination configuration
const GENERIC_DESTINATION = {
  lat: 40.7128,
  lng: -74.0060,
  attractions: [
    { name: "City Plaza & Local Market", lat: 40.7128, lng: -74.0060, type: "Sightseeing", indoor: false },
    { name: "National Historical Museum", lat: 40.7150, lng: -74.0080, type: "Museum", indoor: true },
    { name: "Scenic City Park Walk", lat: 40.7110, lng: -74.0040, type: "Nature", indoor: false },
    { name: "Cultural Center & Art Gallery", lat: 40.7180, lng: -74.0100, type: "Culture", indoor: true },
    { name: "Panoramic Observation Deck", lat: 40.7090, lng: -74.0010, type: "Sightseeing", indoor: true },
    { name: "Adventure Sports & Trails", lat: 40.7250, lng: -73.9980, type: "Adventure", indoor: false }
  ],
  foods: ["Traditional Local Lunch Platter", "Gourmet Dinner Tour", "Signature Coffee & Pastry Spot", "Street Food Market Favorites"],
  transports: ["Local transit", "Taxi", "Walking", "Bicycle rental"]
};

// Local Itinerary Generator Helper
const generateLocalItinerary = (params) => {
  const destName = params.destination.toLowerCase().trim();
  const destData = MOCK_DESTINATIONS[destName] || {
    ...GENERIC_DESTINATION,
    lat: GENERIC_DESTINATION.lat + (Math.random() - 0.5) * 5,
    lng: GENERIC_DESTINATION.lng + (Math.random() - 0.5) * 5
  };

  const start = new Date(params.startDate);
  const end = new Date(params.endDate);
  const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const budgetPerDay = Math.round(params.budget / daysDiff);
  const travelStyle = params.travelStyle || 'Adventure';
  const pace = params.pace || 'Moderate';

  const days = {};

  for (let i = 1; i <= daysDiff; i++) {
    // Pick activities based on day index and preferences
    const attractions = destData.attractions;
    const morningAttraction = attractions[(i * 3 - 3) % attractions.length];
    const afternoonAttraction = attractions[(i * 3 - 2) % attractions.length];
    const eveningAttraction = attractions[(i * 3 - 1) % attractions.length];

    const food1 = destData.foods[(i * 2 - 2) % destData.foods.length];
    const food2 = destData.foods[(i * 2 - 1) % destData.foods.length];

    const trans1 = destData.transports[0];
    const trans2 = destData.transports[1 % destData.transports.length];
    const trans3 = destData.transports[2 % destData.transports.length];

    // Distribute cost from budget
    const morningCost = Math.round(budgetPerDay * 0.2);
    const afternoonCost = Math.round(budgetPerDay * 0.5);
    const eveningCost = Math.round(budgetPerDay * 0.3);

    days[`day${i}`] = {
      morning: {
        activity: `Explore ${morningAttraction.name} - immersive cultural exploration.`,
        attraction: morningAttraction.name,
        food: `Breakfast at a local cafe`,
        transport: trans1,
        cost: morningCost,
        location: { lat: morningAttraction.lat, lng: morningAttraction.lng }
      },
      afternoon: {
        activity: `Participate in ${afternoonAttraction.type} at ${afternoonAttraction.name}.`,
        attraction: afternoonAttraction.name,
        food: `Lunch: ${food1}`,
        transport: trans2,
        cost: afternoonCost,
        location: { lat: afternoonAttraction.lat, lng: afternoonAttraction.lng }
      },
      evening: {
        activity: `Relax at ${eveningAttraction.name} with evening strolls.`,
        attraction: eveningAttraction.name,
        food: `Dinner: ${food2}`,
        transport: trans3,
        cost: eveningCost,
        location: { lat: eveningAttraction.lat, lng: eveningAttraction.lng }
      }
    };
  }

  return days;
};

/**
 * Generate a complete day-wise itinerary
 */
const generateItinerary = async (params) => {
  if (!openai) {
    console.log("OpenAI API key not configured or initialization failed. Using Local Fallback Generator.");
    return generateLocalItinerary(params);
  }

  try {
    const prompt = `
      You are an expert AI Travel Planner. Generate a day-wise travel itinerary for a trip to "${params.destination}" from ${params.startDate} to ${params.endDate}.
      Trip details:
      - Budget: ${params.budget} USD/INR
      - Travelers: ${params.travelers}
      - Travel Style: ${params.travelStyle}
      - Interests: ${params.interests.join(', ')}
      - Pace: ${params.pace}
      - Special Constraints: ${params.constraints || 'None'}

      Generate a detailed day-wise itinerary. Output a JSON object matching the exact structure below. Do not output any markdown headers, just the JSON block.
      Format:
      {
        "day1": {
          "morning": {
            "activity": "Brief description of the morning activity",
            "attraction": "Name of morning attraction",
            "food": "Breakfast suggestion",
            "transport": "Transport mode suggestion",
            "cost": 1500 (number representing estimated cost),
            "location": { "lat": 15.5539, "lng": 73.7553 } (approximate latitude and longitude numbers for the attraction)
          },
          "afternoon": {
            "activity": "...",
            "attraction": "...",
            "food": "Lunch recommendation",
            "transport": "...",
            "cost": 2000,
            "location": { "lat": 15.5435, "lng": 73.7556 }
          },
          "evening": {
            "activity": "...",
            "attraction": "...",
            "food": "Dinner recommendation",
            "transport": "...",
            "cost": 2500,
            "location": { "lat": 15.5562, "lng": 73.7581 }
          }
        },
        "day2": { ... }
      }
      Please ensure you provide real or approximate latitude/longitude (lat, lng) coordinates for the attractions in the destination area so they can be plotted on Google Maps.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const resultText = response.choices[0].message.content;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("OpenAI Itinerary generation failed. Falling back to local helper:", error);
    return generateLocalItinerary(params);
  }
};

/**
 * Handle AI assistant modifications (e.g. "reduce budget", "suggest local food")
 */
const modifyItinerary = async (itinerary, userMessage, destination) => {
  if (!openai) {
    console.log("OpenAI API key not configured. Using Mock Assistant parser.");
    return mockModifyItinerary(itinerary, userMessage, destination);
  }

  try {
    const prompt = `
      You are an AI travel assistant. The user wants to modify their current trip itinerary.
      Destination: ${destination}
      Current Itinerary:
      ${JSON.stringify(itinerary, null, 2)}

      User's request to modify: "${userMessage}"

      Generate the updated itinerary containing the exact same JSON format (keys day1, day2, etc. with morning, afternoon, evening slots). 
      Also provide a friendly, short summary of what was changed under a "message" key.
      Ensure the response is a JSON object with this shape:
      {
        "days": {
          "day1": {
            "morning": { "activity": "...", "attraction": "...", "food": "...", "transport": "...", "cost": 1000, "location": { "lat": ..., "lng": ... } },
            "afternoon": { ... },
            "evening": { ... }
          },
          "day2": { ... }
        },
        "message": "A 1-2 sentence description explaining the changes made to accommodate the user request."
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      days: result.days || result, // handle potential nested structure variations
      message: result.message || "I've successfully updated your itinerary."
    };
  } catch (error) {
    console.error("OpenAI modifyItinerary failed. Falling back to mock assistant:", error);
    return mockModifyItinerary(itinerary, userMessage, destination);
  }
};

/**
 * Mock modification logic to react to key phrases
 */
const mockModifyItinerary = (itinerary, userMessage, destination) => {
  const msg = userMessage.toLowerCase();
  let responseMessage = "I've updated your itinerary according to your request!";
  const daysCopy = JSON.parse(JSON.stringify(itinerary));

  if (msg.includes("budget") || msg.includes("cheaper") || msg.includes("reduce cost")) {
    // Reduce budget by 30%
    Object.keys(daysCopy).forEach(dayKey => {
      ['morning', 'afternoon', 'evening'].forEach(slot => {
        if (daysCopy[dayKey][slot]) {
          daysCopy[dayKey][slot].cost = Math.round(daysCopy[dayKey][slot].cost * 0.7);
          daysCopy[dayKey][slot].activity = `[Budget Friendly] ` + daysCopy[dayKey][slot].activity;
        }
      });
    });
    responseMessage = "I've optimized your activities and dining suggestions to reduce your overall budget by 30%.";
  } else if (msg.includes("adventure") || msg.includes("outdoor") || msg.includes("active")) {
    // Replace some afternoon activities with adventure
    const destName = destination.toLowerCase().trim();
    const destData = MOCK_DESTINATIONS[destName] || GENERIC_DESTINATION;
    const adventures = destData.attractions.filter(a => a.type === "Adventure" || a.type === "Beach");
    
    Object.keys(daysCopy).forEach((dayKey, index) => {
      if (daysCopy[dayKey].afternoon && adventures.length > 0) {
        const adventure = adventures[index % adventures.length];
        daysCopy[dayKey].afternoon.attraction = adventure.name;
        daysCopy[dayKey].afternoon.activity = `Adventure Sport & Thrill Session at ${adventure.name}.`;
        daysCopy[dayKey].afternoon.location = { lat: adventure.lat, lng: adventure.lng };
        daysCopy[dayKey].afternoon.cost += 1000;
      }
    });
    responseMessage = "I've added exciting outdoor adventure excursions and activity stops into your schedule.";
  } else if (msg.includes("food") || msg.includes("local cuisine") || msg.includes("eat") || msg.includes("suggest local food")) {
    const destName = destination.toLowerCase().trim();
    const destData = MOCK_DESTINATIONS[destName] || GENERIC_DESTINATION;
    
    Object.keys(daysCopy).forEach((dayKey, index) => {
      const dinnerFood = destData.foods[(index + 2) % destData.foods.length];
      if (daysCopy[dayKey].evening) {
        daysCopy[dayKey].evening.food = `Gourmet tasting: ${dinnerFood}`;
        daysCopy[dayKey].evening.activity += ` (Includes traditional local culinary tasting)`;
      }
    });
    responseMessage = "I've revised your dining layout to include top-rated local eateries and traditional signature dishes.";
  } else if (msg.includes("museum") || msg.includes("remove museum")) {
    // Replace indoor/museum activities with outdoor park/sightseeing
    const destName = destination.toLowerCase().trim();
    const destData = MOCK_DESTINATIONS[destName] || GENERIC_DESTINATION;
    const outdoors = destData.attractions.filter(a => !a.indoor);
    
    Object.keys(daysCopy).forEach((dayKey, index) => {
      ['morning', 'afternoon', 'evening'].forEach((slot, slotIdx) => {
        if (daysCopy[dayKey][slot] && (daysCopy[dayKey][slot].attraction.toLowerCase().includes("museum") || daysCopy[dayKey][slot].attraction.toLowerCase().includes("gallery"))) {
          const outdoor = outdoors[(index + slotIdx) % outdoors.length];
          daysCopy[dayKey][slot].attraction = outdoor.name;
          daysCopy[dayKey][slot].activity = `Outdoor leisure stroll and sightseeing around ${outdoor.name}.`;
          daysCopy[dayKey][slot].location = { lat: outdoor.lat, lng: outdoor.lng };
        }
      });
    });
    responseMessage = "I've swapped museums and indoor galleries with beautiful open-air parks and outdoor landmarks.";
  } else {
    // Generic modification
    Object.keys(daysCopy).forEach(dayKey => {
      if (daysCopy[dayKey].morning) {
        daysCopy[dayKey].morning.activity += ` (Customized based on request)`;
      }
    });
    responseMessage = `I've updated your activities based on: "${userMessage}".`;
  }

  return {
    days: daysCopy,
    message: responseMessage
  };
};

/**
 * Handle weather-based automatic replanning
 */
const replanForWeather = async (itinerary, weatherCondition, destination) => {
  if (!openai) {
    console.log("OpenAI API key not configured. Using Mock Weather Replanner.");
    return mockReplanForWeather(itinerary, weatherCondition, destination);
  }

  try {
    const prompt = `
      You are an expert travel coordinator. Severe weather Alert: "${weatherCondition}" has been issued for "${destination}".
      Current Itinerary:
      ${JSON.stringify(itinerary, null, 2)}

      Please automatically replan the itinerary. Replace all OUTDOOR activities during bad weather with safe INDOOR alternatives (such as museums, galleries, covered markets, indoor food tours, or cooking classes). Keep the costs and other constraints relatively similar.
      Output a JSON object matching this structure:
      {
        "days": {
          "day1": {
            "morning": { "activity": "...", "attraction": "...", "food": "...", "transport": "...", "cost": ..., "location": { "lat": ..., "lng": ... } },
            "afternoon": { ... },
            "evening": { ... }
          }
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.days || result;
  } catch (error) {
    console.error("OpenAI replanForWeather failed. Falling back to mock replanner:", error);
    return mockReplanForWeather(itinerary, weatherCondition, destination);
  }
};

/**
 * Mock weather replanning logic: checks if attractions are outdoor and replaces them
 */
const mockReplanForWeather = (itinerary, weatherCondition, destination) => {
  const destName = destination.toLowerCase().trim();
  const destData = MOCK_DESTINATIONS[destName] || GENERIC_DESTINATION;
  
  // Find indoor attractions
  const indoorAttractions = destData.attractions.filter(a => a.indoor);
  const fallbackIndoors = indoorAttractions.length > 0 ? indoorAttractions : destData.attractions;

  const daysCopy = JSON.parse(JSON.stringify(itinerary));

  Object.keys(daysCopy).forEach((dayKey, index) => {
    ['morning', 'afternoon', 'evening'].forEach((slot, slotIdx) => {
      const currentActivity = daysCopy[dayKey][slot];
      if (currentActivity) {
        // Mock check: if activity mentions beach, walk, sport, cruise, outdoors
        const isOutdoor = /beach|walk|cruise|sport|water|garden|park|sightseeing|island/i.test(currentActivity.activity) || 
                          /beach|park|garden|island/i.test(currentActivity.attraction);
        
        if (isOutdoor) {
          const indoorSubstitute = fallbackIndoors[(index + slotIdx) % fallbackIndoors.length];
          currentActivity.attraction = indoorSubstitute.name;
          currentActivity.activity = `[Weather Re-routed] Indoor activity at ${indoorSubstitute.name} due to ${weatherCondition}.`;
          currentActivity.location = { lat: indoorSubstitute.lat, lng: indoorSubstitute.lng };
          currentActivity.transport = "Taxi / Covered Transit";
        }
      }
    });
  });

  return daysCopy;
};

module.exports = {
  generateItinerary,
  modifyItinerary,
  replanForWeather
};
