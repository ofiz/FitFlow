const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET user profile
router.get('/profile', auth, userController.getProfile);

// PUT update user profile
router.put('/profile', auth, userController.updateProfile);

// GET user stats (for analytics)
router.get('/stats', auth, userController.getUserStats);

// PUT change password
router.put('/change-password', auth, userController.changePassword);

module.exports = router;