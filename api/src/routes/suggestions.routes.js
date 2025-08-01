const express = require('express');
const router = express.Router();
const CategoryService = require('../services/category.service');

// GET /api/suggestions?q=kazaki
router.get('/', async (req, res) => {
    const { lang = 'fr', includeSubcategories = 'true' } = req.query;
    const q = (req.query.q || '').trim().toLowerCase();
    
    console.log('Recherche :', q);
    
    if (!q) return res.status(400).json({ error: 'Query param "q" is required' });

    try {
       const { categories } = await CategoryService.loadCategories();

       // Construire l'URL complète correctement
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        let categoriesData = categories.categories.map(category => {
            const result = {
                key: category.key,
                categoryId: category.categoryId,
                categoryName: category.categoryName,
                categoryTitle: category.categoryTitles[lang] || category.categoryTitles.fr,
                categoryImage: category.categoryImage,
                // URL complète pour l'API route
                categoryImageUrl: `${baseUrl}/api/categories/image/${category.categoryImage}`,
                // URL alternative pour le static serving
                categoryImageStaticUrl: `${baseUrl}/images/categories/${category.categoryImage}`,
            };

            // Inclure les sous-catégories si demandé
            if (includeSubcategories === 'true') {
                result.subcategories = category.container.map(subcat => ({
                    id: subcat.id,
                    sousCategoryId: subcat.sousCategoryId,
                    sousCategoryName: subcat.sousCategoryName,
                    sousCategoryTitle: subcat.sousCategoryTitles[lang] || subcat.sousCategoryTitles.fr,
                    sousContainer: subcat.sousContainer
                }));
                result.subcategoriesCount = category.container.length;
            }

            return result;
        });
        console.log(categoriesData);
        const suggestions = [];

        categoriesData.forEach(category => {
            const catTitle = category.categoryTitle.toLowerCase();
            const catName = category.categoryName;
            const catImage = category.categoryImageUrl;

            // Suggestion si le titre de catégorie matche
            if (catTitle.includes(q)) {
                suggestions.push({
                    id: category.categoryId,
                    name: category.categoryTitle,
                    category: catName,
                    subcategory: '',
                    displayCategory: null,
                    image: catImage,
                    type: 'category',
                });
            }

            // Suggestion si une sous-catégorie matche
            (category.subcategories || []).forEach(sub => {
                const subTitle = sub.sousCategoryTitle.toLowerCase();
                const subName = sub.sousCategoryName;

                if (subTitle.includes(q)) {
                    suggestions.push({
                        id: sub.sousCategoryId,
                        name: sub.sousCategoryTitle,
                        category: catName,
                        subcategory: subName,
                        displayCategory: category.categoryTitle,
                        image: catImage,
                        type: 'subCategory',
                    });
                }
            });
        });

        return res.json({ success: true, suggestions: suggestions.slice(0, 5) }); // Limite à 5
    } catch (err) {
        console.error('Erreur suggestions :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
