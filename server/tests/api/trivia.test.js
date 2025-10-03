const request = require('supertest');
const app = require('../../server');
const TriviaQuestion = require('../../models/TriviaQuestion');

describe('Trivia API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'trivia@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'trivia@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  // Helper function to create question
  const createTestQuestion = async () => {
    return await TriviaQuestion.create({
      question: 'Test question?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      category: 'general',
      difficulty: 'easy',
      explanation: 'Test explanation'
    });
  };

  describe('GET /api/trivia/question', () => {
    test('Should get a random question', async () => {
      await createTestQuestion();

      const response = await request(app)
        .get('/api/trivia/question')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('question');
      expect(response.body).toHaveProperty('options');
      expect(response.body.options).toHaveLength(4);
    });

    test('Should require authentication', async () => {
      await createTestQuestion();

      const response = await request(app)
        .get('/api/trivia/question');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/trivia/answer', () => {
    test('Should submit correct answer', async () => {
      const question = await createTestQuestion();

      const response = await request(app)
        .post('/api/trivia/answer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          questionId: question._id,
          selectedAnswer: 'A'
        });

      expect(response.status).toBe(200);
      expect(response.body.isCorrect).toBe(true);
      expect(response.body).toHaveProperty('userScore');
      expect(response.body.userScore.totalScore).toBeGreaterThan(0);
    });

    test('Should reject without question ID', async () => {
      const response = await request(app)
        .post('/api/trivia/answer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          selectedAnswer: 'A'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/trivia/stats', () => {
    test('Should get user stats', async () => {
      const response = await request(app)
        .get('/api/trivia/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalScore');
      expect(response.body).toHaveProperty('currentStreak');
    });
  });
});