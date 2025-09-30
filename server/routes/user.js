const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET user profile
router.get('/profile', auth, userController.getProfile);

// PUT update profile
router.put('/profile', auth, userController.updateProfile);

module.exports = router;