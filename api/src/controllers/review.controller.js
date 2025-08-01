const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
    try {
        const { listingId, rating, comment } = req.body;

        if (!listingId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        };

        // Vérifier si ll'annonce existe
        const listing = await prisma.listing.findUnique({
            where: { id: parseInt(listingId) }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée'
            });
        };

        // Empecher à un utilisateur de poster une critique sur sa propre annonce
        if (listing.userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas poster une critique sur votre propre annonce'
            });
        }

        // Vérifier si l'utilisateur a déjà écrit une critique pour cette annonce
        const reviewExists = await prisma.review.findFirst({
            where: {
                listingId,
                userId
            }
        });

        if (reviewExists) {
            return res.status(400).json({
                success: false,
                message: 'Une critique existe déjà pour cet utilisateur et cette annonce'
            });
        }

        // Créer la critique
        const review = await prisma.review.create({
            data: {
                listingId,
                userId,
                rating,
                comment,
                createdAt: new Date(),
            }
        });

        res.status(201).json({
            success: true,
            message: 'Critique créée avec succès',
            data: review
        });
    } catch (error) {
        console.error('[CREATE REVIEW ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la critique',
            error: error.message
        });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Critique non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Critique récupérée avec succès',
            data: review
        });
    } catch (error) {
        console.error('[GET REVIEW BY ID ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la critique',
            error: error.message
        });
    }
};

exports.getReviewsByListingId = async (req, res) => {
    try {
        const { listingId } = req.params;

        const reviews = await prisma.review.findMany({
            where: {
                listingId: parseInt(listingId)
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune revue trouvée pour ce listing'
            });
        };

        res.json({
            success: true,
            message: 'Revues récupérées avec succès',
            data: reviews
        });
    } catch (error) {
        console.error('[GET REVIEWS BY LISTING ID ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}