const request = require('supertest');
const app = require('../app');

jest.mock('../config/db', () => jest.fn());
jest.mock('../models/User');
jest.mock('../models/Trip');
jest.mock('../models/Itinerary');
jest.mock('../models/Notification');
jest.mock('../sockets/socketHandler', () => ({
  sendNotification: jest.fn()
}));

describe('Trips API', () => {
  describe('GET /api/trips', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/trips');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/trips', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/trips')
        .send({ destination: 'Goa' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/trips/trending', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/trips/trending');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/trips/travel-options', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/trips/travel-options')
        .send({ fromCity: 'Delhi', toCity: 'Goa' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Itineraries API', () => {
  describe('GET /api/itineraries/:tripId', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/itineraries/123');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/itineraries/:tripId/chat', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/itineraries/123/chat')
        .send({ message: 'reduce budget' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Notifications API', () => {
  describe('GET /api/notifications', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.statusCode).toBe(401);
    });
  });
});
