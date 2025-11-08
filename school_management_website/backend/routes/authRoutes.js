const express = require('express');
const router = express.Router();
const { login, register, verify } = require('../controllers/authController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);

module.exports = router;
