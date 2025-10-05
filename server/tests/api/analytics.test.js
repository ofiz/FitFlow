const request = require('supertest');
const app = require('../../server');
const Workout = require('../../models/Workout');
const Meal = require('../../models/Meal');

describe('Analytics API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Analytics User',
        email: 'analytics@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'analytics@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  // Helper function to create test workout
  const createTestWorkout = async (daysAgo = 0, duration = 30, calories = 200) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return await Workout.create({
      userId,
      title: `Test Workout ${daysAgo}`,
      duration,
      difficulty: 'Intermediate',
      caloriesBurned: calories,
      date
    });
  };

  // Helper function to create test meal
  const createTestMeal = async (daysAgo = 0, calories = 500) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return await Meal.create({
      userId,
      name: 'Test Meal',
      mealType: 'Lunch',
      calories,
      protein: 30,
      carbs: 50,
      fats: 20,
      time: '12:00',
      date
    });
  };

  describe('GET /api/analytics/workouts', () => {
    beforeEach(async () => {
      await Workout.deleteMany({ userId });
    });

    test('Should get workout stats for the week', async () => {
      // Create workouts for the past week
      await createTestWorkout(1, 30, 200);
      await createTestWorkout(3, 45, 300);
      await createTestWorkout(5, 60, 400);

      const response = await request(app)
        .get('/api/analytics/workouts?period=week')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('chartData');
      expect(response.body.summary.totalWorkouts).toBe(3);
      expect(response.body.summary.totalDuration).toBe(135);
      expect(response.body.summary.totalCaloriesBurned).toBe(900);
    });

    test('Should get workout stats for today', async () => {
      await createTestWorkout(0, 30, 200);
      await createTestWorkout(2, 45, 300); // This should not be included

      const response = await request(app)
        .get('/api/analytics/workouts?period=today')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.summary.totalWorkouts).toBe(1);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/workouts?period=week');

      expect(response.status).toBe(401);
    });

    test('Should return empty stats when no workouts', async () => {
      const response = await request(app)
        .get('/api/analytics/workouts?period=week')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.summary.totalWorkouts).toBe(0);
      expect(response.body.chartData).toEqual([]);
    });
  });

  describe('GET /api/analytics/nutrition', () => {
    beforeEach(async () => {
      await Meal.deleteMany({ userId });
    });

    test('Should get nutrition stats for the week', async () => {
      await createTestMeal(1, 500);
      await createTestMeal(2, 600);
      await createTestMeal(4, 700);

      const response = await request(app)
        .get('/api/analytics/nutrition?period=week')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('chartData');
      expect(response.body.summary.totalMeals).toBe(3);
      expect(response.body.summary.totalCalories).toBe(1800);
    });

    test('Should calculate macros correctly', async () => {
      await createTestMeal(0, 500);

      const response = await request(app)
        .get('/api/analytics/nutrition?period=today')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.summary).toHaveProperty('totalProtein');
      expect(response.body.summary).toHaveProperty('totalCarbs');
      expect(response.body.summary).toHaveProperty('totalFats');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/nutrition?period=week');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/overview', () => {
    test('Should get overview statistics', async () => {
      // Create some test data
      await createTestWorkout(1);
      await createTestMeal(0);

      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('hasCompleteProfile');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('workoutsThisWeek');
      expect(response.body.stats).toHaveProperty('caloriesToday');
    });

    test('Should indicate incomplete profile', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.hasCompleteProfile).toBe(false);
    });

    test('Should calculate BMI when data available', async () => {
      // Update user profile with weight and height
      await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentWeight: 75,
          height: 175
        });

      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.stats.bmi).not.toBeNull();
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/overview');

      expect(response.status).toBe(401);
    });
  });
});