const request = require('supertest');
const app = require('../../server');
const Progress = require('../../models/Progress');
const User = require('../../models/User');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');

jest.setTimeout(15000);

describe('Progress Photo API Tests', () => {
  let authToken;
  let userId;
  let testPhotoPath;

  // Setup: Create a test user and get auth token before all tests
  beforeAll(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Progress Test User',
        email: 'progress@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'progress@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;

    // Create test image path
    testPhotoPath = path.join(__dirname, '../test-photo.jpg');
  });

  // Cleanup: Remove test data after all tests
  afterAll(async () => {
    await Progress.deleteMany({ userId });
    await User.deleteOne({ email: 'progress@example.com' });
    
    // Clean up uploaded files
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/progress-photos');
      const files = await fs.readdir(uploadsDir);
      for (const file of files) {
        if (file.startsWith('progress-')) {
          await fs.unlink(path.join(uploadsDir, file));
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }

    // Close mongoose connection
    await mongoose.connection.close();
  });

  describe('POST /api/progress/upload', () => {
    test('Should upload a progress photo successfully', async () => {
      const response = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Photo uploaded successfully');
      expect(response.body.photo).toHaveProperty('weekNumber', 1);
      expect(response.body.photo).toHaveProperty('imageUrl');
      expect(response.body.photo).toHaveProperty('userId', userId);
    });

    test('Should increment week number for subsequent uploads', async () => {
      // Upload first photo
      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      // Upload second photo
      const response = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      expect(response.status).toBe(201);
      expect(response.body.photo.weekNumber).toBe(2);
    });

    test('Should reject upload without authentication', async () => {
        let attempts = 0;
        let response;
        
        while (attempts < 3) {
            try {
            response = await request(app)
                .post('/api/progress/upload')
                .attach('photo', testPhotoPath)
                .timeout(15000);
            break;
            } catch (error) {
            attempts++;
            if (attempts === 3) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        expect(response.status).toBe(401);
    });

    test('Should reject non-image files', async () => {
        const textFilePath = path.join(__dirname, 'test-file.txt');
        await fs.writeFile(textFilePath, 'This is not an image');

        let attempts = 0;
        let response;
        
        while (attempts < 3) {
            try {
            response = await request(app)
                .post('/api/progress/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('photo', textFilePath)
                .timeout(15000);
            break;
            } catch (error) {
            attempts++;
            if (attempts === 3) {
                await fs.unlink(textFilePath);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        await fs.unlink(textFilePath);
        expect(response.status).toBe(400);
    });

  });

  describe('GET /api/progress/photos', () => {
    beforeEach(async () => {
      // Clear existing photos
      await Progress.deleteMany({ userId });
    });

    test('Should retrieve all progress photos for authenticated user', async () => {
      // Upload two photos first
      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Photos retrieved successfully');
      expect(response.body.photos).toHaveLength(2);
      expect(response.body.photos[0].weekNumber).toBe(1);
      expect(response.body.photos[1].weekNumber).toBe(2);
    });

    test('Should return empty array when user has no photos', async () => {
      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.photos).toHaveLength(0);
    });

    test('Should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/progress/photos');

      expect(response.status).toBe(401);
    });

    test('Should only return photos for the authenticated user', async () => {
      // Create another user and upload a photo
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123'
        });

      const anotherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123'
        });

      const anotherToken = anotherLoginResponse.body.token;

      // Upload photo as another user
      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${anotherToken}`)
        .attach('photo', testPhotoPath);

      // Upload photo as original user
      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      // Get photos for original user
      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.photos).toHaveLength(1);
      expect(response.body.photos[0].userId).toBe(userId);

      // Cleanup
      await User.deleteOne({ email: 'another@example.com' });
    });
  });

  describe('GET /api/progress/photos/:photoId', () => {
    let photoId;

    beforeEach(async () => {
      // Upload a photo
      const uploadResponse = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      photoId = uploadResponse.body.photo._id;
    });

    afterEach(async () => {
      await Progress.deleteMany({ userId });
    });

    test('Should retrieve a specific photo by ID', async () => {
      const response = await request(app)
        .get(`/api/progress/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Photo retrieved successfully');
      expect(response.body.photo._id).toBe(photoId);
    });

    test('Should return 404 for non-existent photo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/progress/photos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Photo not found');
    });

    test('Should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/progress/photos/${photoId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/progress/photos/:photoId', () => {
    let photoId;

    beforeEach(async () => {
      // Upload a photo
      const uploadResponse = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      photoId = uploadResponse.body.photo._id;
    });

    afterEach(async () => {
      await Progress.deleteMany({ userId });
    });

    test('Should delete a progress photo successfully', async () => {
      const response = await request(app)
        .delete(`/api/progress/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Photo deleted successfully');
      expect(response.body.deletedPhotoId).toBe(photoId);

      // Verify photo is deleted
      const photo = await Progress.findById(photoId);
      expect(photo).toBeNull();
    });

    test('Should recalculate week numbers after deletion', async () => {
      // Upload two more photos
      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      // Delete the first photo
      await request(app)
        .delete(`/api/progress/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Check remaining photos
      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.photos).toHaveLength(2);
      expect(response.body.photos[0].weekNumber).toBe(1);
      expect(response.body.photos[1].weekNumber).toBe(2);
    });

    test('Should return 404 for non-existent photo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/progress/photos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Photo not found');
    });

    test('Should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/api/progress/photos/${photoId}`);

      expect(response.status).toBe(401);
    });

    test('Should not allow deleting another user\'s photo', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another2@example.com',
          password: 'password123'
        });

      const anotherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another2@example.com',
          password: 'password123'
        });

      const anotherToken = anotherLoginResponse.body.token;

      // Try to delete original user's photo
      const response = await request(app)
        .delete(`/api/progress/photos/${photoId}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Photo not found');

      // Cleanup
      await User.deleteOne({ email: 'another2@example.com' });
    });
  });
});