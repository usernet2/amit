const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/check-email', authController.checkEmail);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
