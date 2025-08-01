const { PrismaClient } = require("../generated/prisma");
const { subDays, subWeeks, subMonths, format } = require('date-fns');

const prisma = new PrismaClient();

exports.getOverview = async (req, res) => {
    try {
        // Chiffres directs
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({ where: { isActive: true } });
        const onlineUsers = await prisma.user.count({ where: { isOnline: true } });

        const totalStores = await prisma.store.count();
        const activeStores = await prisma.store.count({
            where: { isActive: true, status: 'APPROVED' }
        });

        const totalListings = await prisma.listing.count();
        const activeListings = await prisma.listing.count({
            where: { isActive: true, status: 'APPROVED' }
        });

        // Date du début de la journée (00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newListingsToday = await prisma.listing.count({
            where: {
                publishedAt: { gte: today } // >= aujourd'hui minuit
            }
        });

        res.status(200).json({
            success: true,
            message: "Données statistiques de l'aperçu collectées",
            data: {
                totalUsers,
                activeUsers,
                onlineUsers,
                totalStores,
                activeStores,
                totalListings,
                activeListings,
                newListingsToday
            }
        });

    } catch (error) {
        console.error('[GET STATS OVERVIEW ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur du chargement de l'aperçu"
        });
    }
};

exports.getListingCountByPeriod = async (req, res) => {
    try {
        const range = req.query.range || 'daily';
        let groupByFormat, fromDate;

        const now = new Date();
        switch (range) {
            case 'weekly':
                fromDate = subWeeks(now, 4);
                groupByFormat = 'yyyy-ww'; // week number
                break;
            case 'monthly':
                fromDate = subMonths(now, 6);
                groupByFormat = 'yyyy-MM';
                break;
            case 'daily':
            default:
                fromDate = subDays(now, 14);
                groupByFormat = 'yyyy-MM-dd';
                break;
        }

        const data = await prisma.listing.findMany({
            where: {
                createdAt: { gte: fromDate },
            },
            select: {
                createdAt: true,
            },
        });

        const grouped = data.reduce((acc, item) => {
            const dateKey = format(new Date(item.createdAt), groupByFormat);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, count]) => ({
            date,
            count,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: result
        });
    } catch (error) {
        console.error('[GET LISTING COUNT PERIOD ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur du chargement du nombre d'annonces selon une période"
        });
    }
};

exports.getListingByCategory = async (req, res) => {
    try {
        const result = await prisma.listing.groupBy({
            by: ['category'],
            _count: { category: true },
        });

        const formatted = result.map(item => ({
            category: item.category,
            count: item._count.category,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: formatted,
        });
    } catch (error) {
        console.error('[GET LISTING BY CATEGORY ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur du chargement du nombre d'annonces par catégorie"
        });
    }
};

exports.getTopListings = async (req, res) => {
    const { metric = 'views', limit = 10 } = req.query;
    const validMetrics = ['views', 'likes', 'clicks'];

    if (!validMetrics.includes(metric)) {
        return res.status(400).json({ success: false, message: 'Paramètre metric invalide' });
    }

    try {
        const listings = await prisma.listing.findMany({
            where: { status: 'APPROVED' },
            take: 100, // on prend plus large pour filtrer ensuite
            select: {
                id: true,
                details: true,
                createdAt: true,
                category: true,
                subcategory: true,
                status: true,
                images: true,
                views: true,
                likes: true,
                clicks: true,
                _count: {
                    select: {
                        views: true,
                        clicks: true,
                        likes: true
                    }
                }
            }
        });

        // Trier manuellement en JS
        const sorted = listings
            .sort((a, b) => b._count[metric] - a._count[metric])
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: sorted
        });
    } catch (error) {
        console.error('[GET TOP LISTINGS ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur du chargement du nombre des annonces top"
        });
    }
};

exports.getUsersByRegistration = async (req, res) => {
    try {
        const range = req.query.range || 'monthly';

        let groupByFormat, fromDate;

        const now = new Date();
        switch (range) {
            case 'weekly':
                fromDate = subWeeks(now, 4);
                groupByFormat = 'yyyy-ww'; // week number
                break;
            case 'monthly':
                fromDate = subMonths(now, 6);
                groupByFormat = 'yyyy-MM';
                break;
            case 'daily':
            default:
                fromDate = subDays(now, 14);
                groupByFormat = 'yyyy-MM-dd';
                break;
        }

        const data = await prisma.user.findMany({
            where: {
                createdAt: { gte: fromDate },
            },
            select: {
                createdAt: true,
            },
        });

        const grouped = data.reduce((acc, item) => {
            const dateKey = format(new Date(item.createdAt), groupByFormat);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, count]) => ({
            date,
            count,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: result
        });
    } catch (error) {
        console.error('[GET USERS BT REGISTRATION ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur du chargement du nombre d'utilisateurs"
        });
    }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true,
            },
        });

        const result = usersByRole.map(u => ({
            role: u.role,
            count: u._count.role,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: result
        });
    } catch (error) {
        console.error('[GET USERS BT ROLE ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

exports.getUsersByActivityStatus = async (req, res) => {
    try {
        const threshold = subDays(new Date(), 30); // il y a 30 jours

        const [activeCount, inactiveCount] = await Promise.all([
            prisma.user.count({
                where: {
                    lastLoginAt: {
                        gte: threshold,
                    },
                },
            }),
            prisma.user.count({
                where: {
                    OR: [
                        { lastLoginAt: { lt: threshold } },
                        { lastLoginAt: null },
                    ],
                },
            }),
        ]);

        const data = [
            { status: 'Actif', count: activeCount },
            { status: 'Inactif', count: inactiveCount },
        ]

        res.json({
            success: true,
            message: "Données collectées",
            data: data
        });
    } catch (error) {
        console.error('[GET USERS BY ACTIVITY ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

exports.getStoresCountByPeriod = async (req, res) => {
    try {
        const range = req.query.range || 'monthly';

        let groupByFormat, fromDate;

        const now = new Date();
        switch (range) {
            case 'weekly':
                fromDate = subWeeks(now, 4);
                groupByFormat = 'yyyy-ww'; // week number
                break;
            case 'monthly':
                fromDate = subMonths(now, 6);
                groupByFormat = 'yyyy-MM';
                break;
            case 'daily':
            default:
                fromDate = subDays(now, 14);
                groupByFormat = 'yyyy-MM-dd';
                break;
        }

        const data = await prisma.store.findMany({
            where: {
                createdAt: { gte: fromDate },
            },
            select: {
                createdAt: true,
            },
        });

        const grouped = data.reduce((acc, item) => {
            const dateKey = format(new Date(item.createdAt), groupByFormat);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, count]) => ({
            date,
            count,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: result
        });
    } catch (error) {
        console.error('[GET STORES BY PERIOD ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

exports.getStoresBySector = async (req, res) => {
    try {
        const result = await prisma.store.groupBy({
            by: ['category'], // ou le champ que tu utilises (ex: `category`, `type`, etc.)
            _count: {
                category: true,
            },
        });

        const formatted = result.map((item) => ({
            sector: item.category,
            count: item._count.category,
        }));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: formatted
        });
    } catch (error) {
        console.error('[GET STORES BY SECTOR ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

exports.getStoresTop = async (req, res) => {
    try {
        const { metric = 'followers', limit = 10 } = req.query;
        const validMetrics = ['followers', 'likes'];

        if (!validMetrics.includes(metric)) {
            return res.status(400).json({
                success: false,
                message: "Le paramètre 'metric' doit être 'followers' ou 'likes'",
            });
        }

        const stores = await prisma.store.findMany({
            where: { isActive: true },
            include: {
                followers: metric === 'followers',
                likes: metric === 'likes',
            },
        });

        const sorted = stores.map((store) => ({
            id: store.id,
            name: store.name,
            avatar: store.avatar,
            banner: store.banner,
            category: store.category,
            followers: store.followers,
            likes: store.likes,
            createdAt: store.createdAt,
            [metric]: store[metric].length,
        }))
            .sort((a, b) => b[metric] - a[metric])
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            message: "Données collectées avec succès",
            data: sorted
        });
    } catch (error) {
        console.error('[GET STORES BY METRICS ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};
