const { sanitizeInput, validateTrip, validateRegister } = require('../middleware/validate');

describe('Input Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags from string inputs', () => {
      req.body = { name: '<script>alert("xss")</script>' };
      sanitizeInput(req, res, next);
      expect(req.body.name).not.toContain('<script>');
      expect(req.body.name).toContain('&lt;script&gt;');
      expect(next).toHaveBeenCalled();
    });

    it('should remove javascript: protocol', () => {
      req.body = { url: 'javascript:alert(1)' };
      sanitizeInput(req, res, next);
      expect(req.body.url).not.toContain('javascript:');
      expect(next).toHaveBeenCalled();
    });

    it('should remove event handlers', () => {
      req.body = { text: 'hello onclick=alert(1)' };
      sanitizeInput(req, res, next);
      expect(req.body.text).not.toContain('onclick=');
      expect(next).toHaveBeenCalled();
    });

    it('should not modify non-string values', () => {
      req.body = { count: 5, active: true };
      sanitizeInput(req, res, next);
      expect(req.body.count).toBe(5);
      expect(req.body.active).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      req.body = null;
      sanitizeInput(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateTrip', () => {
    it('should pass with valid trip data', () => {
      req.body = {
        destination: 'Goa',
        startDate: '2025-06-01',
        endDate: '2025-06-05',
        budget: 30000
      };
      validateTrip(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if destination is too short', () => {
      req.body = { destination: 'A', startDate: '2025-06-01', endDate: '2025-06-05', budget: 30000 };
      validateTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail if start date is after end date', () => {
      req.body = { destination: 'Goa', startDate: '2025-06-10', endDate: '2025-06-05', budget: 30000 };
      validateTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail if budget is negative', () => {
      req.body = { destination: 'Goa', startDate: '2025-06-01', endDate: '2025-06-05', budget: -100 };
      validateTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail if budget is zero', () => {
      req.body = { destination: 'Goa', startDate: '2025-06-01', endDate: '2025-06-05', budget: 0 };
      validateTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateRegister', () => {
    it('should pass with valid registration data', () => {
      req.body = { name: 'John', email: 'john@test.com', password: '123456' };
      validateRegister(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid email', () => {
      req.body = { name: 'John', email: 'notanemail', password: '123456' };
      validateRegister(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with short password', () => {
      req.body = { name: 'John', email: 'john@test.com', password: '123' };
      validateRegister(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with short name', () => {
      req.body = { name: 'J', email: 'john@test.com', password: '123456' };
      validateRegister(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
