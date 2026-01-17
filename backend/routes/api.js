const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminDashboard = require('../controllers/adminDashboardController');
const medecinChefDashboard = require('../controllers/medecinChefDashboardController');
const adherantDashboard = require('../controllers/adherantDashboardController');
const adminFormationsController = require('../controllers/adminFormationsController');
const adminVisitesController = require('../controllers/adminVisitesController');
const adminSensibilisationsController = require('../controllers/adminSensibilisationsController');
const adminParticiparionsController = require('../controllers/adminParticiparionsController');
const adminEntreprisesController = require('../controllers/adminEntreprisesController');
const adminCancelledController = require('../controllers/adminCancelledController');
const verifyToken = require('../middleware/auth');
const { verifyAdmin, verifyMedecinChef, verifyAdherant, verifyAdminOrMedecin } = require('../middleware/auth');

// ===== AUTH ROUTES =====
router.post('/auth/register-adherent', authController.registerAdherent);
router.post('/auth/send-confirmation-code', authController.sendConfirmationCode);
router.post('/auth/register-adherent-confirmed', authController.registerAdherentConfirmed);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/profile', verifyToken, authController.getProfile);

// ===== ADMIN ROUTES =====
router.get('/admin/dashboard', verifyToken, verifyAdmin, adminDashboard.getDashboard);

// ENTERPRISES (ADHÉRANTES) ROUTES
router.get('/admin/entreprises', verifyToken, verifyAdmin, adminEntreprisesController.getAll);
router.get('/admin/entreprises/:id', verifyToken, verifyAdmin, adminEntreprisesController.getById);
router.put('/admin/entreprises/:id', verifyToken, verifyAdmin, adminEntreprisesController.update);
router.delete('/admin/entreprises/:id', verifyToken, verifyAdmin, adminEntreprisesController.delete);
router.get('/admin/entreprises/:id/stats', verifyToken, verifyAdmin, adminEntreprisesController.getStats);

// FORMATIONS ROUTES
router.get('/admin/formations', verifyToken, verifyAdmin, adminFormationsController.getFormations);
router.post('/admin/formations', verifyToken, verifyAdmin, adminFormationsController.createFormation);
router.put('/admin/formations/:id', verifyToken, verifyAdmin, adminFormationsController.updateFormation);
router.delete('/admin/formations/:id', verifyToken, verifyAdmin, adminFormationsController.deleteFormation);

// VISITES ROUTES
router.get('/admin/visites', verifyToken, verifyAdmin, adminVisitesController.getVisites);
router.post('/admin/visites/entreprise', verifyToken, verifyAdmin, adminVisitesController.createVisiteEntreprise);
router.post('/admin/visites/systematique', verifyToken, verifyAdmin, adminVisitesController.createVisiteSystematique);
router.put('/admin/visites/:type/:id', verifyToken, verifyAdmin, adminVisitesController.updateVisite);
router.delete('/admin/visites/:type/:id', verifyToken, verifyAdmin, adminVisitesController.deleteVisite);

// SENSIBILISATIONS ROUTES
router.get('/admin/sensibilisations', verifyToken, verifyAdmin, adminSensibilisationsController.getSensibilisations);
router.post('/admin/sensibilisations', verifyToken, verifyAdmin, adminSensibilisationsController.createSensibilisation);
router.put('/admin/sensibilisations/:id', verifyToken, verifyAdmin, adminSensibilisationsController.updateSensibilisation);
router.delete('/admin/sensibilisations/:id', verifyToken, verifyAdmin, adminSensibilisationsController.deleteSensibilisation);

// PARTICIPATIONS ROUTES
router.get('/admin/participations', verifyToken, verifyAdmin, adminParticiparionsController.getParticipations);
router.post('/admin/participations', verifyToken, verifyAdmin, adminParticiparionsController.createParticipation);
router.put('/admin/participations/:id', verifyToken, verifyAdmin, adminParticiparionsController.updateParticipation);
router.delete('/admin/participations/:id', verifyToken, verifyAdmin, adminParticiparionsController.deleteParticipation);

// CANCELLED ACTIVITIES ROUTES
router.get('/admin/cancelled-activities', verifyToken, verifyAdmin, adminCancelledController.getCancelledActivities);
router.post('/admin/replan/:type/:id', verifyToken, verifyAdmin, adminCancelledController.replanifyActivity);
router.post('/admin/cancel/:type/:id', verifyToken, verifyAdmin, adminCancelledController.cancelActivity);

// ===== MÉDECIN CHEF ROUTES =====
router.get('/medecin-chef/dashboard', verifyToken, verifyMedecinChef, medecinChefDashboard.getDashboard);
router.get('/medecin-chef/visites', verifyToken, verifyMedecinChef, medecinChefDashboard.getVisites);
router.get('/medecin-chef/formations', verifyToken, verifyMedecinChef, medecinChefDashboard.getFormations);
router.get('/medecin-chef/sensibilisations', verifyToken, verifyMedecinChef, medecinChefDashboard.getSensibilisations);

// ===== ADHÉRANT ROUTES =====
router.get('/adherant/dashboard', verifyToken, verifyAdherant, adherantDashboard.getDashboard);
router.get('/adherant/visites', verifyToken, verifyAdherant, adherantDashboard.getMyVisites);
router.get('/adherant/formations', verifyToken, verifyAdherant, adherantDashboard.getMyFormations);
router.get('/adherant/sensibilisations', verifyToken, verifyAdherant, adherantDashboard.getMySensibilisations);

router.put('/adherant/cancel-visite/:id', verifyToken, verifyAdherant, adherantDashboard.cancelVisite);
router.put('/adherant/cancel-formation/:id', verifyToken, verifyAdherant, adherantDashboard.cancelFormation);
router.put('/adherant/cancel-sensibilisation/:id', verifyToken, verifyAdherant, adherantDashboard.cancelSensibilisation);

module.exports = router;
