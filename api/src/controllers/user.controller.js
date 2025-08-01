const { PrismaClient } = require('../generated/prisma');
const ClickService = require('../services/click.service');

const prisma = new PrismaClient();

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Utilisateur récupéré avec succès.'
        });
    } catch (error) {
        console.error('[GET USER BY ID ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.updateUserGender = async (req, res) => {
    try {
        const { gender, visibility } = req.body;

        if (!gender) {
            return res.status(400).json({ success: false, message: 'Le genre est requis.' });
        }

        if (!['MALE', 'FEMALE'].includes(gender)) {
            return res.status(400).json({ success: false, message: 'Genre invalide.' });
        }

        if (!['PUBLIC', 'PRIVATE'].includes(visibility)) {
            return res.status(400).json({ success: false, message: 'Visibilité invalide.' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier votre profil lorsque votre compte est désactivé.' });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                gender,
                genderVisibility: visibility
            }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Genre mis à jour avec succès.'
        });
    } catch (error) {
        console.error('[UPDATE USER GENDER ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.updateUserHomeAddress = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, message: 'L\'adresse est requise.' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier votre profil lorsque votre compte est désactivé.' });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                address: address
            }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Adresse mise à jour avec succès.'
        });
    } catch (error) {
        console.error('[UPDATE USER HOME ADDRESS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.updateUserWokAddress = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, message: 'L\'adresse de service est requise.' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier votre profil lorsque votre compte est désactivé.' });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                workAddress: address
            }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Adresse de service mise à jour avec succès.'
        });
    } catch (error) {
        console.error('[UPDATE USER WORKING ADDRESS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.sendPresencePing = async (req, res) => {
    try {
        const user = req.user;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                lastOnline: new Date(),
                isOnline: true,
            },
            select: {
                id: true,
                lastOnline: true,
                isOnline: true,
            },
        });

        console.log('Présence mise à jour pour', updatedUser.id);

        res.status(200).json({
            success: true,
            message: 'Présence mise à jour',
            lastOnline: updatedUser.lastOnline,
        });
    } catch (error) {
        console.error('[UPDATE USER PRESENCE ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de présence',
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: req.body
        });

        res.status(200).json({
            data: updatedUser,
            message: 'Utilisateur mis à jour avec succès.'
        });
    } catch (error) {
        console.error('[UPDATE USER ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 30 } = req.query;

        // Récupérer toutes les annonces de l'utilisateur
        const userListings = await prisma.listing.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                clicks: true,
                views: true,
                createdAt: true,
                status: true
            }
        });

        if (userListings.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Aucune annonce trouvée',
                data: {
                    summary: {
                        totalListings: 0,
                        totalClicks: 0,
                        totalViews: 0,
                        averageCTR: 0
                    },
                    listings: [],
                    trends: {}
                }
            });
        }

        const listingIds = userListings.map(l => l.id);

        // Récupérer les clics récents
        const recentClicks = await prisma.click.findMany({
            where: {
                listingId: { in: listingIds },
                createdAt: {
                    gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                listing: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculer les statistiques par annonce
        const listingStats = userListings.map(listing => {
            const listingClicks = recentClicks.filter(c => c.listingId === listing.id);
            const ctr = listing.views > 0 ? ((listing.clicks / listing.views) * 100).toFixed(2) : 0;

            return {
                id: listing.id,
                title: listing.title,
                totalClicks: listing.clicks,
                totalViews: listing.views,
                recentClicks: listingClicks.length,
                ctr: parseFloat(ctr),
                status: listing.status,
                createdAt: listing.createdAt
            };
        });

        // Calculer les tendances
        const trends = ClickService.calculateTrends(recentClicks, parseInt(period));

        // Résumé global
        const summary = {
            totalListings: userListings.length,
            activeListings: userListings.filter(l => l.status === 'ACTIVE').length,
            totalClicks: userListings.reduce((sum, l) => sum + l.clicks, 0),
            totalViews: userListings.reduce((sum, l) => sum + l.views, 0),
            recentClicks: recentClicks.length,
            averageCTR: listingStats.length > 0 ?
                (listingStats.reduce((sum, l) => sum + l.ctr, 0) / listingStats.length).toFixed(2) : 0
        };

        return res.status(200).json({
            success: true,
            message: 'Tableau de bord récupéré avec succès',
            data: {
                summary,
                listings: listingStats.sort((a, b) => b.recentClicks - a.recentClicks),
                trends,
                period: parseInt(period)
            }
        });
    } catch (error) {
        console.error('[GET USER DASHBOARD STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.exportUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 30, format = 'csv' } = req.query;

        const userListings = await prisma.listing.findMany({
            where: { userId },
            include: {
                clicks: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
                        }
                    },
                    include: {
                        user: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                }
            }
        });

        if (format === 'csv') {
            const csvData = ClickService.generateCSV(userListings);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=stats-${period}j-${Date.now()}.csv`);

            return res.status(200).send(csvData);
        }

        // Format JSON par défaut
        return res.status(200).json({
            success: true,
            data: userListings,
            exportedAt: new Date().toISOString(),
            period: parseInt(period)
        });
    } catch (error) {
        console.error('[EXPORT USER STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUserEmails = async (req, res) => {

    try {
        const userEmails = await prisma.email.findMany({
            where: { userId: req.user.id },
            select: {
                id: true,
                email: true,
                type: true,
                verified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!userEmails || userEmails.length === 0) {
            return res.status(404).json({ message: 'Aucun email trouvé pour cet utilisateur' });
        }

        res.status(200).json({
            success: true,
            data: userEmails,
            message: 'Emails récupérés avec succès'
        });
    } catch (error) {
        console.error('[GET USER EMAILS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}