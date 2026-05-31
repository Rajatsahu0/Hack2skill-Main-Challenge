const axios = require('axios');

/**
 * Fetch current weather conditions for a city
 */
const getWeather = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return getMockWeather(city);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;
    
    // Check if weather is disruptive (e.g. heavy rain, thunderstorm, extreme winds, snow)
    const condition = data.weather[0].main;
    const isDisruptive = ['Rain', 'Thunderstorm', 'Snow', 'Tornado', 'Squall'].includes(condition);

    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: condition,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      isDisruptive
    };
  } catch (error) {
    console.error(`OpenWeather API request failed for ${city}. Using Mock fallback.`, error.message);
    return getMockWeather(city);
  }
};

/**
 * Fallback mock weather database for local-only tests
 */
const getMockWeather = (city) => {
  const cityName = city.toLowerCase();
  
  // Custom mock weather mapping to keep dashboard items feeling contextual
  let picked = { condition: 'Clear', description: 'clear sky', temp: 26, isDisruptive: false };
  
  if (cityName.includes('goa')) {
    picked = { condition: 'Clear', description: 'sunny beach weather', temp: 31, isDisruptive: false };
  } else if (cityName.includes('paris')) {
    picked = { condition: 'Clouds', description: 'scattered clouds', temp: 19, isDisruptive: false };
  } else if (cityName.includes('tokyo')) {
    picked = { condition: 'Clear', description: 'clear blue skies', temp: 22, isDisruptive: false };
  } else {
    // Generate simple deterministic conditions based on string length hash
    const hash = city.length % 4;
    const conditions = [
      { condition: 'Clear', description: 'clear sky', temp: 27, isDisruptive: false },
      { condition: 'Clouds', description: 'overcast clouds', temp: 20, isDisruptive: false },
      { condition: 'Clouds', description: 'broken clouds', temp: 24, isDisruptive: false },
      { condition: 'Clear', description: 'sunny day', temp: 30, isDisruptive: false }
    ];
    picked = conditions[hash];
  }

  return {
    temp: picked.temp,
    feelsLike: picked.temp - 1,
    condition: picked.condition,
    description: picked.description,
    humidity: 65,
    windSpeed: 3.8,
    icon: picked.condition === 'Clear' ? '01d' : '03d',
    isDisruptive: picked.isDisruptive
  };
};

module.exports = {
  getWeather,
  getMockWeather
};
