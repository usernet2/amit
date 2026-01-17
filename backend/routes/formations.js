const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const formationsController = require('../controllers/formationsController');

router.get('/', verifyToken, formationsController.getFormations);
router.post('/enroll', verifyToken, formationsController.enrollFormation);
router.post('/cancel', verifyToken, formationsController.cancelFormation);

module.exports = router;
