const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const clickController = require('../controllers/click.contoller');

const router = express.Router();


router.post('/record', authenticate, clickController.recordClick); // Enregistre un clic sur une annonce
router.get('/:listingId/stats', authenticate, clickController.getClickStats); // Récupère les statistiques de clics pour une annonce
router.get('/:listingId/recent', authenticate, clickController.getRecentClicks); // Récupère les clics récents pour une annonce
router.get('/stats/:userId', authenticate, clickController.getGlobalStats); // Récupère les statistiques de clics pour un utilisateur

module.exports = router;