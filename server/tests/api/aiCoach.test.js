const request = require('supertest');
const app = require('../../server');

describe('AI Coach API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Coach User',
        email: 'aicoach@test.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aicoach@test.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user._id;
  });

  describe('POST /api/ai-coach/chat', () => {
    test('Should send message and receive AI response', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What is a good workout for beginners?'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    }, 20000);

    test('Should reject empty message', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Message is required');
    });

    test('Should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .send({
          message: 'What exercises should I do?'
        });

      expect(response.status).toBe(401);
    });

    test('Should handle fitness-related questions', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'How many calories should I eat to lose weight?'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
    }, 15000);

    test('Should redirect non-fitness questions', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What is the capital of France?'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response.toLowerCase()).toMatch(/fitness|nutrition|specialized/i);
    }, 15000);

    test('Should handle conversation history', async () => {
      const conversationHistory = [
        {
          sender: 'user',
          message: 'I want to build muscle'
        },
        {
          sender: 'ai',
          message: 'Great! Focus on compound exercises and progressive overload.'
        }
      ];

      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'How often should I train?',
          conversationHistory
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
    }, 15000);

    test('Should handle multiple nutrition questions', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What should I eat before a workout?'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
    }, 15000);

    test('Should provide appropriate error for API issues', async () => {
      const response = await request(app)
        .post('/api/ai-coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Test message'
        });

      expect([200, 500]).toContain(response.status);
      if (response.status === 500) {
        expect(response.body.message).toBeDefined();
      }
    }, 15000);
  });
});