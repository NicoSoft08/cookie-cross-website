const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/:id', userController.getUserById); //  Route publique pour récupérer les détails d'un utilisateur


// Routes privées
router.get('/:id/email-addresses', authenticate, userController.getUserEmails); // Récupérer les emails d'un utilisateur
router.post('/:id/export-stats', authenticate, userController.exportUserStats); // Exporter les statistiques d'un utilisateur
router.get('/:id/dashboard/stats', authenticate, userController.getUserDashboardStats); // Récupérer les statistiques du tableau de bord d'un utilisateur
router.put('/:id', authenticate, userController.updateUser); // Mettre à jour les détails d'un utilisateur
router.get('/:id/profile', authenticate, userController.getUserById); // Récupérer les détails d'un utilisateur connecté
router.put('/:id/gender/update', authenticate, userController.updateUserGender); // Mettre à jour le genre d'un utilisateur
router.put('/:id/home-address/update', authenticate, userController.updateUserHomeAddress); // Mettre à jour l'adresse de résidence d'un utilisateur
router.put('/:id/working-address/update', authenticate, userController.updateUserWokAddress); // Mettre à jour l'adresse de service d'un utilisateur
router.post('/presence', authenticate, userController.sendPresencePing); // Mettre à jour la présence de User Online/Offline

module.exports = router;