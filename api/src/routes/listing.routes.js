const express = require('express');
const listingController = require('../controllers/listing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const router = express.Router();

// Routes publiques
router.get('/', listingController.getListings); // liste des annonces
router.get('/:id', listingController.getListingById); // détail d'une annonce
router.get('/search/query', listingController.searchListing); // création d'une annonce

// Routes privées
router.post('/create', authenticate, listingController.createListing); // création d'une annonce
router.post('/:id/share', authenticate, listingController.updateShareCount); // Mettre à jour le nombre de partage d'un post
router.post('/:id/report', authenticate, listingController.reportListing); // Signaler une annonce
router.post('/:id/views', authenticate, listingController.incrementViewCount); // Mettre à jour le nombre de vue d'un post
router.post('/:id/clicks', authenticate, listingController.incrementClickCount); // Mettre à jour le nombre de click d'un post
router.post('/:id/add-favorite', authenticate, listingController.addFavorite); // Ajouter un post des favoris de l'utilisateur
router.post('/:id/remove-favorite', authenticate, listingController.removeFavorite); // Supprimer un post des favoris de l'utilisateur


module.exports = router;