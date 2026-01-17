const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const visitesController = require('../controllers/visitesController');

router.get('/', verifyToken, visitesController.getVisites);
router.post('/cancel', verifyToken, visitesController.cancelVisite);

module.exports = router;
