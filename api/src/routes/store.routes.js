const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer');

// Routes public
router.get('/', storeController.getStores); // Récupérer les boutiques créées et approuvées
router.get('/slug/:slug', storeController.getStoreBySlug); // Récupérer une boutique par son slug
router.get('/id/:id', storeController.getStoreById); // Récupérer une boutique par son id
router.get('/id/:id/listings', storeController.getStoreListings); // Récupérer les listings d'une boutique


// Routes privées
router.post('/create', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), storeController.createStore); // Route pour créer une boutique
router.get('/user/:userId', authenticate, storeController.getStoreByUserId); // Route pour récupérer une boutique par l'id de l'utilisateur
router.post('/id/:id/follow', authenticate, storeController.followStore); // Route privée pour suivre une boutique
router.delete('/id/:id/unfollow', authenticate, storeController.unfollowStore); // Route privée pour ne plus suivre une boutique
router.post('/:id/like', authenticate, storeController.likeStore); // Route privée pour liker une boutique
router.delete('/:id/unlike', authenticate, storeController.unlikeStore); // Route privée pour ne plus liker une boutique
router.post('/:id/visits', authenticate, storeController.incrementStoreVisit);

module.exports = router;