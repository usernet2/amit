const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const adminCancelledController = require('../controllers/adminCancelledController');

// Get all cancelled activities
router.get('/', verifyToken, verifyAdmin, adminCancelledController.getCancelledActivities);

// Replan a cancelled activity
router.post('/replan/:type/:id', verifyToken, verifyAdmin, adminCancelledController.replanifyActivity);

// Cancel an activity
router.post('/cancel/:type/:id', verifyToken, verifyAdmin, adminCancelledController.cancelActivity);

module.exports = router;
