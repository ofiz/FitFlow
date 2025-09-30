const request = require('supertest');
const app = require('../../server');
const Workout = require('../../models/Workout');

describe('Workouts API Tests', () => {
  let token;
  let userId;
  let workoutId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'workouts@example.com',
        password: 'password123'
      });

    token = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/workouts', () => {
    test('Should create a new workout with valid data', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Morning Run',
          duration: 30,
          exercises: [
            { name: 'Running', duration: 30 }
          ],
          difficulty: 'Intermediate',
          caloriesBurned: 300
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Morning Run');
      expect(response.body.duration).toBe(30);
      
      workoutId = response.body._id;
    });

    test('Should reject workout without title', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          duration: 30
        });

      expect(response.status).toBe(400);
    });

    test('Should reject workout without duration', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Workout'
        });

      expect(response.status).toBe(400);
    });

    test('Should reject workout without auth token', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .send({
          title: 'Test Workout',
          duration: 30
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      await Workout.create({
        userId,
        title: 'Test Workout 1',
        duration: 30,
        date: new Date()
      });
    });

    test('Should get all workouts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('Should return empty array if no workouts', async () => {
      await Workout.deleteMany({ userId });

      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/workouts');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workouts/:id', () => {
    test('Should get a single workout by ID', async () => {
      const createResponse = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Single Workout',
          duration: 45,
          difficulty: 'Advanced'
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .get(`/api/workouts/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(id);
      expect(response.body.title).toBe('Single Workout');
    });

    test('Should return 404 for non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    test('Should return 400 for invalid workout ID format', async () => {
      const response = await request(app)
        .get('/api/workouts/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    test('Should update a workout', async () => {
      const createResponse = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Original Title',
          duration: 30,
          difficulty: 'Beginner'
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .put(`/api/workouts/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          duration: 45,
          difficulty: 'Advanced'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.duration).toBe(45);
      expect(response.body.difficulty).toBe('Advanced');
    });

    test('Should return 404 for non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(404);
    });

    test('Should not allow updating another user\'s workout', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.token;

      // Create workout with first user
      const createResponse = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Workout',
          duration: 30
        });

      const workoutId = createResponse.body._id;

      // Try to update with other user
      const response = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    test('Should delete a workout', async () => {
      const createResponse = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Workout to Delete',
          duration: 30
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .delete(`/api/workouts/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Workout deleted');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/workouts/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    test('Should return 404 for non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});