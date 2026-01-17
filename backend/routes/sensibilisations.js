const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const sensibilisationsController = require('../controllers/sensibilisationsController');

router.get('/', verifyToken, sensibilisationsController.getSensibilisations);
router.get('/check', verifyToken, sensibilisationsController.hasSensibilisations);
router.post('/cancel', verifyToken, sensibilisationsController.cancelSensibilisation);

module.exports = router;
