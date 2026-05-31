const { getWeather, getMockWeather } = require('../services/weatherService');

describe('Weather Service', () => {
  describe('getMockWeather', () => {
    it('should return weather data for Goa', () => {
      const weather = getMockWeather('Goa');
      expect(weather).toHaveProperty('temp');
      expect(weather).toHaveProperty('condition');
      expect(weather).toHaveProperty('description');
      expect(weather).toHaveProperty('icon');
      expect(weather).toHaveProperty('isDisruptive');
      expect(weather.temp).toBe(31);
      expect(weather.condition).toBe('Clear');
    });

    it('should return weather data for Paris', () => {
      const weather = getMockWeather('Paris');
      expect(weather.condition).toBe('Clouds');
      expect(weather.temp).toBe(19);
    });

    it('should return weather data for Tokyo', () => {
      const weather = getMockWeather('Tokyo');
      expect(weather.condition).toBe('Clear');
      expect(weather.temp).toBe(22);
    });

    it('should return generic weather for unknown cities', () => {
      const weather = getMockWeather('RandomCity');
      expect(weather).toHaveProperty('temp');
      expect(weather).toHaveProperty('condition');
      expect(weather.isDisruptive).toBe(false);
    });

    it('should always return humidity and windSpeed', () => {
      const weather = getMockWeather('AnyCity');
      expect(weather).toHaveProperty('humidity');
      expect(weather).toHaveProperty('windSpeed');
      expect(typeof weather.humidity).toBe('number');
      expect(typeof weather.windSpeed).toBe('number');
    });
  });
});
