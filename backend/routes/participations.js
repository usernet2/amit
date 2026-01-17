const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const adminParticiparionsController = require('../controllers/adminParticiparionsController');

// Get all participations
router.get('/', verifyToken, adminParticiparionsController.getParticipations);

// Create new participation
router.post('/', verifyToken, adminParticiparionsController.createParticipation);

// Update participation
router.put('/:id', verifyToken, adminParticiparionsController.updateParticipation);

// Delete participation (soft delete)
router.delete('/:id', verifyToken, adminParticiparionsController.deleteParticipation);

module.exports = router;
