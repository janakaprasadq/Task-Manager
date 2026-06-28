const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { protect } = require('./authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', protect, authController.getAllUsers);

module.exports = router;