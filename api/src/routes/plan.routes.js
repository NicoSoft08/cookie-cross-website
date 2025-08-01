const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');

router.get('/', planController.getPlans); // Routes public pour récupérer les boutiques créées et approuvées
router.get('/:slug', planController.getPlanBySlug); // Route publique pour récupérer une boutique par son slug

router.get('/services/photo-pack', planController.getPhotoPacks);

module.exports = router;