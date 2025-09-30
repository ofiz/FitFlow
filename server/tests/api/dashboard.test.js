const request = require('supertest');
const app = require('../../server');
const Workout = require('../../models/Workout');
const Meal = require('../../models/Meal');

describe('Dashboard API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'dashboard@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dashboard@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('GET /api/dashboard/stats', () => {
    test('Should return dashboard stats with zero values for new user', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('workoutsThisWeek');
      expect(response.body).toHaveProperty('caloriesToday');
      expect(response.body).toHaveProperty('currentWeight');
      expect(response.body).toHaveProperty('activeStreak');
      expect(response.body.workoutsThisWeek).toBe(0);
      expect(response.body.caloriesToday).toBe(0);
    });

    test('Should calculate workouts correctly', async () => {
      // Create workouts
      await Workout.create({
        userId,
        title: 'Test Workout 1',
        duration: 30,
        date: new Date()
      });

      await Workout.create({
        userId,
        title: 'Test Workout 2',
        duration: 45,
        date: new Date()
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.workoutsThisWeek).toBe(2);
    });

    test('Should calculate calories correctly', async () => {
      // Create meals
      await Meal.create({
        userId,
        name: 'Breakfast',
        mealType: 'Breakfast',
        calories: 500,
        time: '08:00',
        date: new Date()
      });

      await Meal.create({
        userId,
        name: 'Lunch',
        mealType: 'Lunch',
        calories: 700,
        time: '13:00',
        date: new Date()
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.caloriesToday).toBe(1200);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats');

      expect(response.status).toBe(401);
    });
  });
});