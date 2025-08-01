const { PrismaClient } = require('../generated/prisma');
const ClickService = require('../services/click.service');

const prisma = new PrismaClient();

exports.recordClick = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user.id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        // Récupérer la localisation depuis les headers ou une API
        const location = {
            city: req.get('CF-IPCity') || req.body.city || null,
            country: req.get('CF-IPCountry') || req.body.country || null
        };

        const result = await ClickService.recordClick(
            listingId,
            userId,
            ipAddress,
            userAgent,
            location
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                clickId: result.click?.id,
                recorded: !!result.click
            }
        });
    } catch (error) {
        console.error('[RECORD CLICK ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getClickStats = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { period = 30 } = req.query;
        const userId = req.user.id;

        // Vérifier que l'utilisateur est propriétaire de l'annonce
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true }
        });

        if (!listing || listing.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const result = await ClickService.getClickStats(listingId, parseInt(period));
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('[GET CLICK STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getRecentClicks = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { limit = 50 } = req.query;
        const userId = req.user.id;

        // Vérifier que l'utilisateur est propriétaire de l'annonce
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true }
        });

        if (!listing || listing.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        const result = await ClickService.getRecentClicks(listingId, parseInt(limit));

        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Clics récents récupérés avec succès',
            data: {
                clicks: result.clicks,
                total: result.clicks.length
            }
        });
    } catch (error) {
        console.error('[GET RECENT CLICKS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getGlobalStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await ClickService.getGlobalClickStats(userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Statistiques globales récupérées avec succès',
            data: result.stats
        });
    } catch (error) {
        console.error('[GET GLOBAL STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}