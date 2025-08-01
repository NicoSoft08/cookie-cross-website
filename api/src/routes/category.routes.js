const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Routes
router.get('/', categoryController.getCategories); // Route pour récupérer toutes les catégories
router.get('/:slug', categoryController.getCategoryBySlug); // Route pour récupérer une catégorie spécifique
router.get('/:id/fields', categoryController.getCategoryFields);

router.get('/search', categoryController.searchCategories); // Route pour rechercher des catégories
router.get('/stats', categoryController.getCategoriesStats); // Route pour obtenir les statistiques des catégories
router.get('/image/:imageName', categoryController.getCategoryByImageName); // Route pour servir les images des catégories
router.get('/:categoryId/subcategories/:subcategoryId', categoryController.getSubcategoryById); // Route pour récupérer une sous-catégorie spécifique

module.exports = router;