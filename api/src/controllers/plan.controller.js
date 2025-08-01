const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.getPlans = async (req, res) => {
    try {
        const plans = await prisma.pricing.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!plans || plans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun plan trouvé',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Plans récupérés avec succès',
            data: plans,
        });
    } catch (error) {
        console.error('[GET PLANS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des plans',
        });
    }
};

exports.getPlanBySlug = async (req, res) => {
    const { slug } = req.params;

    // 🧠 Vérification du slug
    if (!slug) {
        return res.status(400).json({
            success: false,
            message: 'Slug manquant',
        });
    }

    try {
        const plan = await prisma.pricing.findUnique({
            where: {
                slug: slug,
            }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan non trouvé',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Plan récupéré avec succès',
            data: plan,
        });
    } catch (error) {
        console.error('[GET PLAN BY SLUG ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du plan',
        });
    }
};

exports.getPhotoPacks = async (req, res) => {
    try {
        const packs = await prisma.photoPack.findMany({
            where: { active: true }
        });

        if (packs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun pack photo trouvé',
            });
        }

        res.status(200).json({
            success: true,
            message: "Pack photo collecté",
            data: packs
        })
    } catch (error) {
        console.error('[GET PHOTO PACK ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
}