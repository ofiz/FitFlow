const express = require('express');
const router = express.Router();
const aiCoachController = require('../controllers/aiCoachController');
const auth = require('../middleware/auth');

router.post('/chat', auth, aiCoachController.chat);

module.exports = router;