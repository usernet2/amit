const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');

// Import all admin controllers
const adminFormationsController = require('../controllers/adminFormationsController');
const adminVisitesController = require('../controllers/adminVisitesController');
const adminSensibilisationsController = require('../controllers/adminSensibilisationsController');
const adminParticiparionsController = require('../controllers/adminParticiparionsController');
const adminCancelledController = require('../controllers/adminCancelledController');
const adminEntreprisesController = require('../controllers/adminEntreprisesController');

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(verifyAdmin);

// ============ ENTERPRISES (ADHÉRANTES) ROUTES ============
router.get('/entreprises', adminEntreprisesController.getAll);
router.get('/entreprises/:id', adminEntreprisesController.getById);
router.put('/entreprises/:id', adminEntreprisesController.update);
router.delete('/entreprises/:id', adminEntreprisesController.delete);
router.get('/entreprises/:id/stats', adminEntreprisesController.getStats);

// ============ FORMATIONS ROUTES ============
router.get('/formations', adminFormationsController.getFormations);
router.post('/formations', adminFormationsController.createFormation);
router.put('/formations/:id', adminFormationsController.updateFormation);
router.delete('/formations/:id', adminFormationsController.deleteFormation);

// ============ VISITES ROUTES ============
router.get('/visites', adminVisitesController.getVisites);
router.post('/visites/entreprise', adminVisitesController.createVisiteEntreprise);
router.post('/visites/systematique', adminVisitesController.createVisiteSystematique);
router.put('/visites/:type/:id', adminVisitesController.updateVisite);
router.delete('/visites/:type/:id', adminVisitesController.deleteVisite);

// ============ SENSIBILISATIONS ROUTES ============
router.get('/sensibilisations', adminSensibilisationsController.getSensibilisations);
router.post('/sensibilisations', adminSensibilisationsController.createSensibilisation);
router.put('/sensibilisations/:id', adminSensibilisationsController.updateSensibilisation);
router.delete('/sensibilisations/:id', adminSensibilisationsController.deleteSensibilisation);

// ============ PARTICIPATIONS ROUTES ============
router.get('/participations', adminParticiparionsController.getParticipations);
router.post('/participations', adminParticiparionsController.createParticipation);
router.put('/participations/:id', adminParticiparionsController.updateParticipation);
router.delete('/participations/:id', adminParticiparionsController.deleteParticipation);

// ============ CANCELLED ACTIVITIES ROUTES ============
router.get('/cancelled', adminCancelledController.getCancelledActivities);
router.post('/replan/:type/:id', adminCancelledController.replanifyActivity);
router.post('/cancel/:type/:id', adminCancelledController.cancelActivity);

module.exports = router;
