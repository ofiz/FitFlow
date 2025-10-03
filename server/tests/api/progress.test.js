const request = require('supertest');
const app = require('../../server');
const Progress = require('../../models/Progress');
const User = require('../../models/User');
const path = require('path');
const fs = require('fs').promises;

jest.setTimeout(20000);

describe('Progress Photo API Tests', () => {
  let authToken;
  let userId;
  let testPhotoPath;
  const uploadedFiles = new Set(); 

  beforeAll(async () => {
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

    testPhotoPath = path.join(__dirname, '../test-photo.jpg');
  });

  const trackUploadedFile = (imageUrl) => {
    const filename = path.basename(imageUrl);
    uploadedFiles.add(filename);
  };

  afterAll(async () => {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/progress-photos');
      
      for (const filename of uploadedFiles) {
        try {
          await fs.unlink(path.join(uploadsDir, filename));
        } catch (error) {
        }
      }
    } catch (error) {
    }
  });

  describe('POST /api/progress/upload', () => {
    test('Should upload a progress photo successfully', async () => {
      const response = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Photo uploaded successfully');
      expect(response.body.photo).toHaveProperty('imageUrl');
      expect(response.body.photo).toHaveProperty('userId', userId);
      
      trackUploadedFile(response.body.photo.imageUrl);
    });

    test('Should reject upload without photo file', async () => {
      const response = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No photo file provided');
    });
  });

  describe('GET /api/progress/photos', () => {
    beforeEach(async () => {
      await Progress.deleteMany({ userId });
    });

    test('Should retrieve all progress photos for authenticated user', async () => {
      const upload1 = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);
      trackUploadedFile(upload1.body.photo.imageUrl);

      const upload2 = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);
      trackUploadedFile(upload2.body.photo.imageUrl);

      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Photos retrieved successfully');
      expect(response.body.photos).toHaveLength(2);
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

      const upload1 = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${anotherToken}`)
        .attach('photo', testPhotoPath);
      trackUploadedFile(upload1.body.photo.imageUrl);

      const upload2 = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);
      trackUploadedFile(upload2.body.photo.imageUrl);

      const response = await request(app)
        .get('/api/progress/photos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.photos).toHaveLength(1);
      expect(response.body.photos[0].userId).toBe(userId);
    });
  });

  describe('GET /api/progress/photos/:photoId', () => {
    let photoId;

    beforeEach(async () => {
      const uploadResponse = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      photoId = uploadResponse.body.photo._id;
      trackUploadedFile(uploadResponse.body.photo.imageUrl);
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
      const uploadResponse = await request(app)
        .post('/api/progress/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath);

      photoId = uploadResponse.body.photo._id;
      trackUploadedFile(uploadResponse.body.photo.imageUrl);
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

      const photo = await Progress.findById(photoId);
      expect(photo).toBeNull();
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

      const response = await request(app)
        .delete(`/api/progress/photos/${photoId}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Photo not found');
    });
  });
});