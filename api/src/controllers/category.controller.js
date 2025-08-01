const path = require('path');
const fs = require('fs').promises;
const CategoryService = require("../services/category.service");
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

exports.getCategories = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const categories = await prisma.listingCategory.findMany({
            where: { parentId: null },
            include: {
                children: true
            },
            orderBy: { name: 'asc' }
        });

        const categoriesWithImages = categories.map(category => {
            // Format les enfants avec image complète
            const formattedChildren = category.children.map(child => ({
                ...child,
                image: child.image
                    ? `${baseUrl}/public/images/categories/${category.slug}/${child.image}`
                    : null
            }));

            return {
                ...category,
                image: category.image
                    ? `${baseUrl}/public/images/categories/${category.slug}/${category.image}`
                    : null,
                children: formattedChildren
            };
        });

        // Sous-catégories à part si besoin
        const subcategories = await prisma.listingCategory.findMany({
            where: {
                parentId: {
                    in: categories.map(cat => cat.id)
                }
            },
        });

        res.json({
            success: true,
            message: "Catégories collectées",
            data: categoriesWithImages,
            catsCount: categories.length,
            subcatsCount: subcategories.length
        });

    } catch (error) {
        console.error('[CATEGORY FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getCategoryFields = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.listingCategory.findUnique({
            where: { id },
            select: { id: true, name: true, formSchema: true }
        });

        if (!category) return res.status(404).json({ success: false, message: "Catégorie introuvable" });

        res.json({ success: true, data: category.formSchema || { fields: [] } });
    } catch (error) {
        console.error('[GET CATEGORY FIELDS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};


exports.getCategoryBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Get category with its subcategories in a single query
        const category = await prisma.listingCategory.findUnique({
            where: { slug },
            include: {
                children: true, // Include subcategories
                parent: true    // Include parent category if exists
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Catégorie non trouvée'
            });
        }

        // Add full image URL if image exists
        const categoryWithImage = {
            ...category,
            image: category.image
                ? `${baseUrl}/public/images/categories/${category.slug}/${category.image}`
                : null
        };

        const listingInthisCategory = await prisma.listing.findMany({
            where: { categoryId: category.id },
        })

        res.json({
            success: true,
            message: 'Catégorie récupérée avec succès',
            data: {
                category,
                ...categoryWithImage
            },
            listings: listingInthisCategory,
        });
    } catch (error) {
        console.error('[FETCH CATEGORY BY SLUG ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getSubcategoryById = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { lang = 'fr' } = req.query;

        const categoriesData = await CategoryService.loadCategories();

        const category = categoriesData.categories.find(
            cat => cat.categoryId === parseInt(categoryId)
        );

        // if (!category) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'Catégorie non trouvée'
        //     });
        // }

        const subcategory = category.container.find(
            subcat => subcat.sousCategoryId === parseInt(subcategoryId)
        );

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Sous-catégorie non trouvée'
            });
        }

        const result = {
            id: subcategory.id,
            sousCategoryId: subcategory.sousCategoryId,
            sousCategoryName: subcategory.sousCategoryName,
            sousCategoryTitle: subcategory.sousCategoryTitles[lang] || subcategory.sousCategoryTitles.fr,
            sousCategoryTitles: subcategory.sousCategoryTitles,
            sousContainer: subcategory.sousContainer,
            parentCategory: {
                categoryId: category.categoryId,
                categoryName: category.categoryName,
                categoryTitle: category.categoryTitles[lang] || category.categoryTitles.fr
            }
        };

        res.json({
            success: true,
            message: 'Sous-catégorie récupérée avec succès',
            data: result
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de la sous-catégorie:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la sous-catégorie',
            error: error.message
        });
    }
};

exports.getCategoryByImageName = async (req, res) => {
    try {
        const { imageName } = req.params;

        // Validation du nom de fichier pour éviter les attaques de traversée de répertoire
        if (!imageName || imageName.includes('..') || imageName.includes('/')) {
            return res.status(400).json({
                success: false,
                message: 'Nom de fichier invalide'
            });
        }

        const imagePath = path.join(__dirname, '../public/images/categories', imageName);

        // Vérifier si le fichier existe
        try {
            await fs.access(imagePath);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée'
            });
        }

        // Headers CORS pour les images
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');

        // Déterminer le type MIME
        const ext = path.extname(imageName).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };

        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Définir les en-têtes de cache
        res.set({
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400', // Cache pendant 24h
            'ETag': `"${imageName}"`,
            'Last-Modified': new Date().toUTCString()
        });

        // Envoyer le fichier
        res.sendFile(imagePath);

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'image',
            error: error.message
        });
    }
};

exports.searchCategories = async (req, res) => {
    try {
        const { q, lang = 'fr' } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Le terme de recherche doit contenir au moins 2 caractères'
            });
        }

        const categoriesData = await CategoryController.loadCategories();
        const searchTerm = q.toLowerCase().trim();

        const results = [];

        // Construire l'URL complète correctement
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        categoriesData.categories.forEach(category => {
            const categoryTitle = category.categoryTitles[lang] || category.categoryTitles.fr;

            // Recherche dans les catégories principales
            if (categoryTitle.toLowerCase().includes(searchTerm) ||
                category.categoryName.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'category',
                    categoryId: category.categoryId,
                    categoryName: category.categoryName,
                    categoryTitle,
                    categoryImage: category.categoryImage,
                    // URL complète pour l'API route
                    categoryImageUrl: `${baseUrl}/api/categories/image/${category.categoryImage}`,
                    // URL alternative pour le static serving
                    categoryImageStaticUrl: `${baseUrl}/images/categories/${category.categoryImage}`,
                });
            }

            // Recherche dans les sous-catégories
            category.container.forEach(subcat => {
                const subcatTitle = subcat.sousCategoryTitles[lang] || subcat.sousCategoryTitles.fr;

                if (subcatTitle.toLowerCase().includes(searchTerm) ||
                    subcat.sousCategoryName.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'subcategory',
                        categoryId: category.categoryId,
                        categoryName: category.categoryName,
                        categoryTitle,
                        subcategoryId: subcat.sousCategoryId,
                        subcategoryName: subcat.sousCategoryName,
                        subcategoryTitle: subcatTitle
                    });
                }
            });
        });

        res.json({
            success: true,
            message: `${results.length} résultat(s) trouvé(s)`,
            data: {
                results,
                total: results.length,
                searchTerm: q,
                language: lang
            }
        });

    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche',
            error: error.message
        });
    }
};

exports.getCategoriesStats = async (req, res) => {
    try {
        const categoriesData = await CategoryController.loadCategories();

        const stats = {
            totalCategories: categoriesData.categories.length,
            totalSubcategories: categoriesData.categories.reduce(
                (total, cat) => total + cat.container.length, 0
            ),
            categoriesWithSubcategories: categoriesData.categories.filter(
                cat => cat.container.length > 0
            ).length,
            averageSubcategoriesPerCategory: Math.round(
                categoriesData.categories.reduce((total, cat) => total + cat.container.length, 0) /
                categoriesData.categories.length * 100
            ) / 100,
            categoryBreakdown: categoriesData.categories.map(cat => ({
                categoryId: cat.categoryId,
                categoryName: cat.categoryName,
                subcategoriesCount: cat.container.length
            }))
        };

        res.json({
            success: true,
            message: 'Statistiques récupérées avec succès',
            data: stats
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
}

