// Test the local itinerary generator and mock modify functions
// We test without OpenAI key to exercise the fallback paths

describe('OpenAI Service - Local Fallback', () => {
  let service;

  beforeAll(() => {
    // Ensure no API keys are set so fallback is used
    delete process.env.OPENAI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.XAI_API_KEY;
    service = require('../services/openaiService');
  });

  describe('generateItinerary', () => {
    it('should generate itinerary for Goa using local fallback', async () => {
      const result = await service.generateItinerary({
        destination: 'Goa',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        budget: 30000,
        travelers: 2,
        travelStyle: 'Adventure',
        interests: ['Beach', 'Food'],
        pace: 'Relaxed'
      });

      expect(result).toHaveProperty('day1');
      expect(result.day1).toHaveProperty('morning');
      expect(result.day1).toHaveProperty('afternoon');
      expect(result.day1).toHaveProperty('evening');
      expect(result.day1.morning).toHaveProperty('activity');
      expect(result.day1.morning).toHaveProperty('attraction');
      expect(result.day1.morning).toHaveProperty('cost');
      expect(result.day1.morning).toHaveProperty('location');
      expect(result.day1.morning.location).toHaveProperty('lat');
      expect(result.day1.morning.location).toHaveProperty('lng');
    });

    it('should generate correct number of days', async () => {
      const result = await service.generateItinerary({
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-05',
        budget: 100000,
        travelers: 1,
        travelStyle: 'Culture',
        interests: ['Museums'],
        pace: 'Moderate'
      });

      expect(result).toHaveProperty('day1');
      expect(result).toHaveProperty('day5');
    });

    it('should use generic destination for unknown cities', async () => {
      const result = await service.generateItinerary({
        destination: 'UnknownCity123',
        startDate: '2025-06-01',
        endDate: '2025-06-02',
        budget: 10000,
        travelers: 1,
        travelStyle: 'Adventure',
        interests: [],
        pace: 'Fast'
      });

      expect(result).toHaveProperty('day1');
      expect(result.day1.morning).toHaveProperty('activity');
    });

    it('should distribute budget across days', async () => {
      const result = await service.generateItinerary({
        destination: 'Bengaluru',
        startDate: '2025-06-01',
        endDate: '2025-06-02',
        budget: 20000,
        travelers: 1,
        travelStyle: 'Adventure',
        interests: ['Food'],
        pace: 'Moderate'
      });

      const dayCost = result.day1.morning.cost + result.day1.afternoon.cost + result.day1.evening.cost;
      expect(dayCost).toBe(10000); // 20000 / 2 days
    });
  });

  describe('modifyItinerary', () => {
    const mockItinerary = {
      day1: {
        morning: { activity: 'Beach visit', attraction: 'Baga Beach', cost: 2000, food: 'Cafe', transport: 'Taxi', location: { lat: 15.55, lng: 73.75 } },
        afternoon: { activity: 'Museum tour', attraction: 'Goa State Museum', cost: 5000, food: 'Restaurant', transport: 'Bus', location: { lat: 15.49, lng: 73.82 } },
        evening: { activity: 'Dinner', attraction: 'Fort Aguada', cost: 3000, food: 'Seafood', transport: 'Walk', location: { lat: 15.49, lng: 73.77 } }
      }
    };

    it('should reduce budget when asked', async () => {
      const result = await service.modifyItinerary(mockItinerary, 'reduce budget', 'Goa');
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('message');
      expect(result.days.day1.morning.cost).toBeLessThan(2000);
    });

    it('should add adventure activities when asked', async () => {
      const result = await service.modifyItinerary(mockItinerary, 'add adventure activities', 'Goa');
      expect(result).toHaveProperty('days');
      expect(result.message).toContain('adventure');
    });

    it('should suggest local food when asked', async () => {
      const result = await service.modifyItinerary(mockItinerary, 'suggest local food', 'Goa');
      expect(result).toHaveProperty('days');
      expect(result.message.toLowerCase()).toContain('food');
    });

    it('should remove museums when asked', async () => {
      const result = await service.modifyItinerary(mockItinerary, 'remove museums', 'Goa');
      expect(result).toHaveProperty('days');
      expect(result.days.day1.afternoon.attraction).not.toContain('Museum');
    });

    it('should handle generic requests', async () => {
      const result = await service.modifyItinerary(mockItinerary, 'make it more fun', 'Goa');
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('message');
    });
  });

  describe('replanForWeather', () => {
    const mockItinerary = {
      day1: {
        morning: { activity: 'Beach walk at Baga Beach', attraction: 'Baga Beach', cost: 2000, food: 'Cafe', transport: 'Taxi', location: { lat: 15.55, lng: 73.75 } },
        afternoon: { activity: 'Indoor museum visit', attraction: 'Goa State Museum', cost: 5000, food: 'Restaurant', transport: 'Bus', location: { lat: 15.49, lng: 73.82 } },
        evening: { activity: 'Dinner at restaurant', attraction: 'Fort Aguada', cost: 3000, food: 'Seafood', transport: 'Walk', location: { lat: 15.49, lng: 73.77 } }
      }
    };

    it('should replace outdoor activities with indoor ones', async () => {
      const result = await service.replanForWeather(mockItinerary, 'Heavy Rain', 'Goa');
      expect(result.day1.morning.activity).toContain('Weather Re-routed');
    });

    it('should keep indoor activities unchanged', async () => {
      const result = await service.replanForWeather(mockItinerary, 'Heavy Rain', 'Goa');
      // Museum is indoor, should not be re-routed
      expect(result.day1.afternoon.activity).not.toContain('Weather Re-routed');
    });

    it('should update transport for re-routed activities', async () => {
      const result = await service.replanForWeather(mockItinerary, 'Thunderstorm', 'Goa');
      expect(result.day1.morning.transport).toContain('Taxi');
    });
  });
});
