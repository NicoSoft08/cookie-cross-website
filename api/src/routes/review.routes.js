const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Routes
router.post('/create', authenticate, reviewController.createReview); // Route pour créer une nouvelle critique
router.get('/:id', reviewController.getReviewById); // Route pour récupérer une critique par ID
router.get('/listing/:listingId', reviewController.getReviewsByListingId); // Route pour récupérer les critiques par ID de listing

module.exports = router;