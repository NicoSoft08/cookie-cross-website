const cron = require('node-cron');
const webpush = require('web-push');
const { PrismaClient } = require('../generated/prisma');
const CleanupJob = require('../services/cleanup.job.service');
const MonitoringService = require('../services/monitoring.service');

const prisma = new PrismaClient();

// Actions sur les utilisateurs
exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                createdAt: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                avatar: true,
                isActive: true,
            },
            orderBy: { createdAt: 'asc' }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }
        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
            message: 'Utilisateurs récupérés avec succès.'
        });
    } catch (error) {
        console.error('[GET USERS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({
            data: user,
            message: 'Utilisateur récupéré avec succès.'
        });
    } catch (error) {
        console.error('[GET USER BY ID ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Interdiction de se supprimer soi-même
        if (req.user.id === id) {
            return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });

        if (!existingUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        console.error('[DELETE USER ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['ADMIN', 'MODERATOR', 'USER'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({
            message: "Rôle invalide. Rôles autorisés : ADMIN, MODERATOR, USER"
        });
    }

    // Empêcher qu’un admin modifie son propre rôle
    if (req.user.id === id) {
        return res.status(400).json({
            message: "Vous ne pouvez pas modifier votre propre rôle."
        });
    }

    try {
        const targetUser = await prisma.user.findUnique({ where: { id } });

        if (!targetUser) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // Interdire modification du rôle d'un autre admin
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({
                message: "Impossible de modifier le rôle d’un autre administrateur."
            });
        }

        await prisma.user.update({
            where: { id },
            data: { role },
        });

        res.status(200).json({ message: `Rôle de l'utilisateur mis à jour en ${role}` });
    } catch (error) {
        console.error('[UPDATE USER ROLE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.toggleUserActive = async (req, res) => {
    const { id } = req.params;

    // Interdire à un admin de se bannir lui-même
    if (req.user.id === id) {
        return res.status(400).json({ message: "Vous ne pouvez pas désactiver votre propre compte." });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // Interdire la désactivation d’un autre admin
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: "Impossible de désactiver un administrateur." });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { active: !user.isActive },
        });

        const status = updatedUser.isActive ? "activé" : "désactivé";
        res.json({ message: `Utilisateur ${status} avec succès.` });
    } catch (error) {
        console.error('[TOGGLE USER ACTIVE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUserLoginStats = async (req, res) => {
    try {
        const { userId, days = 30 } = req.query;

        const stats = await prisma.loginLog.groupBy({
            by: ['status', 'country', 'city'],
            where: {
                userId: parseInt(userId),
                createdAt: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            },
            _count: {
                _all: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        const failedAttempts = await prisma.loginLog.findMany({
            where: {
                userId: parseInt(userId),
                status: 'FAILURE',
                createdAt: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            },
            distinct: ['ipAddress'],
            select: {
                ipAddress: true,
                country: true,
                city: true,
                createdAt: true,
                reason: true
            }
        });

        res.json({
            success: true,
            stats,
            failedAttempts,
            suspiciousIps: failedAttempts.filter(a =>
                a.ipAddress !== req.ip // Exclure l'IP actuelle
            ).map(a => a.ipAddress)
        });
    } catch (error) {
        console.error('[GET USER LOGIN STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUsersCountries = async (req, res) => {
    try {
        const counties = [];

        const users = await prisma.user.findMany({
            select: {
                country: true,
            }
        });

        users.forEach(user => {
            if (user.country && !counties.includes(user.country)) {
                counties.push(user.country);
            }
        });

        res.json({ counties });
    } catch (error) {
        console.error('[GET USERS COUNTRIES ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}

// Actions sur les annonces
exports.getListings = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            select: {
                id: true,
                details: true,
                category: true,
                subcategory: true,
                images: true,
                status: true,
                isActive: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                storeId: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!listings || listings.length === 0) {
            return res.status(404).json({ message: 'Aucune annonce trouvée.' });
        }

        const storeIds = [...new Set(listings.map(listing => listing.storeId))];

        const stores = await prisma.store.findMany({
            where: {
                id: {
                    in: storeIds
                }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                banner: true,
                description: true,
                category: true,
                slug: true,
            }
        });

        const storeMap = Object.fromEntries(stores.map(store => [store.id, store]));

        const listingsWithStore = listings.map(listing => ({
            ...listing,
            store: storeMap[listing.storeId] || null
        }));

        res.status(200).json({
            success: true,
            data: listingsWithStore,
            message: 'Listings récupérés avec succès.'
        });
    } catch (error) {
        console.error('[GET LISTINGS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getListingById = async (req, res) => {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!listing) {
            return res.status(404).json({ message: 'Annonce non trouvée.' });
        }

        res.status(200).json({
            data: listing,
            message: 'Annonce récupérée avec succès.'
        });
    } catch (error) {
        console.error('[GET LISTING BY ID ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!listing) {
            return res.status(404).json({ message: 'Annonce non trouvée.' });
        }

        await prisma.listing.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        res.status(200).json({ message: 'Annonce supprimée avec succès.' });
    } catch (error) {
        console.error('[DELETE LISTING ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.toggleListingActive = async (req, res) => {
    try {
        const listingId = req.params.id;

        if (!listingId) {
            return res.status(400).json({
                success: false,
                message: 'ID de l\'annonce requis'
            });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, title: true, isActive: true, status: true }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Vérifier que l'annonce peut être activée/désactivée
        if (listing.status === 'DELETED' || listing.status === 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Impossible de modifier une annonce supprimée ou rejetée'
            });
        }

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: { isActive: !listing.isActive }
        });

        res.status(200).json({
            success: true,
            message: `Annonce ${updatedListing.isActive ? 'activée' : 'désactivée'} avec succès.`
        });
    } catch (error) {
        console.error('[TOGGLE LISTING ACTIVE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.approveListing = async (req, res) => {
    try {
        // Vérifier si l'annonce existe 
        const listing = await prisma.listing.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Annonce non trouvée.' });
        }

        // Changer le statut de l'annonce en "APPROVED"
        await prisma.listing.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                status: 'APPROVED'
            }
        });

        // Récupérer le magasin associé à l'annonce
        const store = await prisma.store.findUnique({
            where: {
                id: listing.storeId
            }
        });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Magasin non trouvé.' });
        }

        // Récupérer les abonnées de ce magasin
        const subscribers = await prisma.storeSubscription.findMany({
            where: {
                storeId: store.id,
            },
            include: {
                user: {
                    include: { storeSubscriptions: true }
                }
            }
        });

        // Envoie la notification à chaque abonné
        const notificationPayload = (listing) => JSON.stringify({
            title: `Nouvelle annonce : ${listing.title}`,
            body: `Une nouvelle annonce a été publiée par la boutique.`,
            icon: '../public/images/logos/logo-letter-bg.png',
            data: {
                url: `/category/${listing.category}/${listing.subcategory}/listing/${listing.details?.title}`
            }
        });

        // Envoie la notification à chaque abonné
        await Promise.all(
            subscribers.flatMap(
                sub => {
                    return sub.user.storeSubscriptions.map(pushSub => {
                        return webpush.sendNotification(
                            pushSub, notificationPayload(listing)).catch(err => {
                            console.error('Erreur lors de l\'envoi de la notification :', err);
                            return null;
                        })
                    })
                }
            )
        );

        res.status(200).json({ message: 'Annonce approuvée avec succès.' });
    } catch (error) {
        console.error('[APPROVE LISTING ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.rejectListing = async (req, res) => {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!listing) {
            return res.status(404).json({ message: 'Annonce non trouvée.' });
        }

        await prisma.listing.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                status: 'REJECTED'
            }
        });

        res.status(200).json({ message: 'Annonce rejetée avec succès.' });
    } catch (error) {
        console.error('[REJECT LISTING ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.cleanup = async (req, res) => {
    try {
        const result = await CleanupJob.runAllCleanupTasks();

        res.json({
            success: true,
            message: 'Nettoyage exécuté avec succès',
            data: result
        });
    } catch (error) {
        console.error('[CLEANUP ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getCleanupStats = async (req, res) => {
    try {
        const stats = await MonitoringService.getTaskStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[GET CLEANUP STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.runCleanup = async (req, res) => {
    try {
        console.log(`🧹 Nettoyage manuel déclenché par ${req.user.email}`);

        const result = await CleanupJob.runAllCleanupTasks();

        // Enregistrer l'action dans les logs
        await MonitoringService.logTaskExecution(
            'MANUAL_CLEANUP',
            result.success ? 'SUCCESS' : 'ERROR',
            {
                triggeredBy: req.user.email,
                userId: req.user.id,
                ...result
            }
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Nettoyage exécuté avec succès',
                data: {
                    duration: result.duration,
                    results: result.results,
                    executedAt: new Date(),
                    executedBy: req.user.email
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erreur lors du nettoyage',
                error: result.error
            });
        }
    } catch (error) {
        // Enregistrer l'erreur
        await MonitoringService.logTaskExecution(
            'MANUAL_CLEANUP',
            'ERROR',
            {
                triggeredBy: req.user.email,
                userId: req.user.id,
                error: error.message
            }
        );
        console.error('[RUN CLEANUP ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.runTaskTypeCleanup = async (req, res) => {
    try {
        const { taskType } = req.params;
        let result;
        let taskName;

        switch (taskType) {
            case 'codes':
                result = await CleanupJob.cleanupExpiredCodes();
                taskName = 'CLEANUP_EXPIRED_CODES';
                break;

            case 'users':
                result = await CleanupJob.cleanupUnverifiedUsers();
                taskName = 'CLEANUP_UNVERIFIED_USERS';
                break;

            case 'listings':
                result = await CleanupJob.cleanupExpiredListings();
                taskName = 'CLEANUP_EXPIRED_LISTINGS';
                break;

            case 'sessions':
                result = await CleanupJob.cleanupExpiredSessions();
                taskName = 'CLEANUP_EXPIRED_SESSIONS';
                break;

            case 'files':
                result = await CleanupJob.cleanupTempFiles();
                taskName = 'CLEANUP_TEMP_FILES';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Type de tâche invalide',
                    availableTypes: ['codes', 'users', 'listings', 'sessions', 'files']
                });
        }

        // Enregistrer l'action dans les logs
        await MonitoringService.logTaskExecution(
            taskName,
            'SUCCESS',
            {
                triggeredBy: req.user.email,
                userId: req.user.id,
                result,
                taskType
            }
        );

        res.json({
            success: true,
            message: `Nettoyage ${taskType} exécuté avec succès`,
            data: {
                taskType,
                result,
                executedAt: new Date(),
                executedBy: req.user.email
            }
        });
    } catch (error) {
        console.error('[RUN TASK TYPE CLEANUP ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getCleanupHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, taskName, status } = req.query;

        const where = {};
        if (taskName) where.taskName = taskName;
        if (status) where.status = status;

        const history = await prisma.taskLog?.findMany({
            where,
            orderBy: { executedAt: 'desc' },
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit)
        });

        const total = await prisma.taskLog?.count({ where });

        res.json({
            success: true,
            data: {
                history: history || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total || 0,
                    pages: Math.ceil((total || 0) / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('[GET CLEANUP HISTORY ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getScheduledStatus = async (req, res) => {
    try {
        const tasks = cron.getTasks();

        const taskStatus = {
            totalTasks: tasks.size,
            runningTasks: Array.from(tasks.values()).filter(task => task.running).length,
            scheduledTasks: [
                {
                    name: 'Nettoyage codes expirés',
                    schedule: '0 * * * *', // Toutes les heures
                    description: 'Supprime les codes de vérification expirés'
                },
                {
                    name: 'Nettoyage utilisateurs non vérifiés',
                    schedule: '0 2 * * *', // Tous les jours à 2h
                    description: 'Supprime les utilisateurs non vérifiés après 24h'
                },
                {
                    name: 'Nettoyage annonces expirées',
                    schedule: '0 3 * * *', // Tous les jours à 3h
                    description: 'Marque les annonces expirées'
                },
                {
                    name: 'Nettoyage fichiers temporaires',
                    schedule: '0 4 * * *', // Tous les jours à 4h
                    description: 'Supprime les fichiers temporaires anciens'
                },
                {
                    name: 'Nettoyage complet hebdomadaire',
                    schedule: '0 1 * * 0', // Dimanche à 1h
                    description: 'Exécute toutes les tâches de nettoyage'
                }
            ]
        };

        res.json({
            success: true,
            data: taskStatus
        });
    } catch (error) {
        console.error('[GET SCHEDULED STATUS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany();
        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('[GET SUBSCRIPTIONS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getSubscriptionStats = async (req, res) => {
    try {
        const stats = await prisma.subscription.aggregate({
            _sum: {
                amount: true
            }
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[GET SUBSCRIPTION STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getUserSubscriptions = async (req, res) => {
    try {
        const { userId } = req.params;
        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: userId
            }
        });

        if (!subscriptions) {
            return res.status(404).json({ message: 'Aucune souscription trouvée pour cet utilisateur' });
        }

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('[GET USER SUBSCRIPTIONS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.forceExpireSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: userId
            }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Aucune souscription trouvée pour cet utilisateur' });
        }

        await prisma.subscription.update({
            where: {
                id: subscription.id
            },
            data: {
                expired: true,
                reason: reason
            }
        });

        // Envoi d'une notification à l'utilisateur
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (user) {
            await emailService.sendEmail(user.email, 'Votre souscription a été expirée', `Votre souscription a été expirée pour la raison suivante : ${reason}`);
        }

        res.json({
            success: true,
            message: 'Souscription expirée avec succès'
        });
    } catch (error) {
        console.error('[FORCE EXPIRE SUBSCRIPTION ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.suspendSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: userId
            }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Aucune souscription trouvée pour cet utilisateur' });
        }

        await prisma.subscription.update({
            where: {
                id: subscription.id
            },
            data: {
                suspended: true,
                reason: reason
            }
        });

        // Envoi d'une notification à l'utilisateur
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (user) {
            await emailService.sendEmail(user.email, 'Votre souscription a été suspendue', `Votre souscription a été suspendue pour la raison suivante : ${reason}`);
        }

        res.json({
            success: true,
            message: 'Souscription suspendue avec succès'
        });
    } catch (error) {
        console.error('[SUSPEND SUBSCRIPTION ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.unsuspendSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: userId
            }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Aucune souscription trouvée pour cet utilisateur' });
        }

        await prisma.subscription.update({
            where: {
                id: subscription.id
            },
            data: {
                suspended: false,
                reason: reason
            }
        });

        // Envoi d'une notification à l'utilisateur
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (user) {
            await emailService.sendEmail(user.email, 'Votre souscription a été réactivée', `Votre souscription a été réactivée pour la raison suivante : ${reason}`);
        }

        res.json({
            success: true,
            message: 'Souscription réactivée avec succès'
        });
    } catch (error) {
        console.error('[UNSUSPEND SUBSCRIPTION ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.grantSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { duration, reason } = req.body;

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: userId
            }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Aucune souscription trouvée pour cet utilisateur' });
        }

        await prisma.subscription.update({
            where: {
                id: subscription.id
            },
            data: {
                duration: duration,
                reason: reason
            }
        });

        // Envoi d'une notification à l'utilisateur
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (user) {
            await emailService.sendEmail(user.email, 'Votre souscription a été prolongée', `Votre souscription a été prolongée pour la raison suivante : ${reason}`);
        }

        res.json({
            success: true,
            message: 'Souscription prolongée avec succès'
        });
    } catch (error) {
        console.error('[GRANT SUBSCRIPTION ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.createSubscriptionPlan = async (req, res) => {
    try {
        const { name, slug, price, duration, description, maxListings, maxPhotosPerListing } = req.body;

        const subscriptionPlan = await prisma.subscriptionPlan.create({
            data: {
                name,
                slug,
                price,
                duration,
                description,
                maxListings,
                maxPhotosPerListing
            }
        });

        res.json({
            success: true,
            message: 'Plan de souscription créé avec succès',
            subscriptionPlan
        });
    } catch (error) {
        console.error('[CREATE SUBSCRIPTION PLAN ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.updateSubscriptionPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const { name, price, duration } = req.body;

        const subscriptionPlan = await prisma.subscriptionPlan.update({
            where: {
                id: planId
            },
            data: {
                name,
                price,
                duration
            }
        });

        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Plan de souscription non trouvé' });
        }

        res.json({
            success: true,
            message: 'Plan de souscription mis à jour avec succès',
            subscriptionPlan
        });
    } catch (error) {
        console.error('[UPDATE SUBSCRIPTION PLAN ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.deactivateSubscriptionPlan = async (req, res) => {
    try {
        const { planId } = req.params;

        const subscriptionPlan = await prisma.subscriptionPlan.update({
            where: {
                id: planId
            },
            data: {
                active: false
            }
        });

        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Plan de souscription non trouvé' });
        }

        res.json({
            success: true,
            message: 'Plan de souscription désactivé avec succès',
            subscriptionPlan
        });
    } catch (error) {
        console.error('[DEACTIVATE SUBSCRIPTION PLAN ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.runRenewalProcess = async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: {
                endDate: {
                    lte: new Date()
                }
            }
        });

        for (const subscription of subscriptions) {
            const user = await prisma.user.findUnique({
                where: {
                    id: subscription.userId
                }
            });

            if (!user) {
                continue;
            }
            const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
                where: {
                    id: subscription.planId
                }
            });

            if (!subscriptionPlan) {
                continue;
            }

            const newEndDate = new Date(subscription.endDate);
            newEndDate.setDate(newEndDate.getDate() + subscriptionPlan.duration);
            await prisma.subscription.update({
                where: {
                    id: subscription.id
                },
                data: {
                    endDate: newEndDate
                }
            });

            await emailService.sendEmail(user.email, 'Votre souscription a été prolongée', `Votre souscription a été prolongée pour la raison suivante : ${subscriptionPlan.name}`);

            res.json({
                success: true,
                message: 'Renouvellement de la souscription effectué avec succès'
            });
        }
    } catch (error) {
        console.error('[RUN RENEWAL PROCESS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.processExpiredSubscriptions = async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: {
                endDate: {
                    lte: new Date()
                }
            }
        });

        for (const subscription of subscriptions) {
            const user = await prisma.user.findUnique({
                where: {
                    id: subscription.userId
                }
            });

            if (!user) {
                continue;
            }

            await prisma.subscription.delete({
                where: {
                    id: subscription.id
                }
            });

            await emailService.sendEmail(user.email, 'Votre souscription a expiré', 'Votre souscription a expiré et a été supprimée');

            res.json({
                success: true,
                message: 'Traitement des souscriptions expirées effectué avec succès'
            });
        }
    } catch (error) {
        console.error('[PROCESS EXPIRED SUBSCRIPTIONS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;

        const revenueReport = await prisma.revenueReport.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        res.json({
            success: true,
            revenueReport
        });
    } catch (error) {
        console.error('[GET REVENUE REPORT ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.toggleScheduled = async (req, res) => {
    try {
        const { action } = req.body; // 'start' ou 'stop'

        if (action === 'start') {
            CleanupJob.startScheduledTasks();
            message = 'Tâches programmées démarrées';
        } else if (action === 'stop') {
            CleanupJob.stopScheduledTasks();
            message = 'Tâches programmées arrêtées';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Action invalide. Utilisez "start" ou "stop"'
            });
        }

        // Enregistrer l'action
        await MonitoringService.logTaskExecution(
            'SCHEDULED_TASKS_TOGGLE',
            'SUCCESS',
            {
                action,
                triggeredBy: req.user.email,
                userId: req.user.id
            }
        );

        res.json({
            success: true,
            message,
            data: {
                action,
                executedAt: new Date(),
                executedBy: req.user.email
            }
        });

    } catch (error) {
        console.error('[TOGGLE SCHEDULED ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune revue trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Revues récupérées avec succès',
            data: reviews
        });
    } catch (error) {
        console.error('[GET REVIEWS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.deleteReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReview = await prisma.review.delete({
            where: {
                id: parseInt(id)
            }
        });

        if (!deletedReview) {
            return res.status(404).json({
                success: false,
                message: 'Revue non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Revue supprimée avec succès',
            data: deletedReview
        });
    } catch (error) {
        console.error('[DELETE REVIEW BY ID ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getStores = async (req, res) => {
    try {
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
                banner: true,
                category: true,
                description: true,
                status: true,
                likes: true,
                followers: true,
                isActive: true,
                badges: {
                    select: {
                        id: true,
                        badgeId: true,
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                label: true,
                                color: true,
                                bg: true,
                            }
                        }
                    }
                },
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                        displayName: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        listings: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!stores || stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun magasin trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Magasins récupérés avec succès',
            data: stores
        });
    } catch (error) {
        console.error('[GET STORES ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.approveStore = async (req, res) => {
    const { id } = req.params;

    try {
        // Vérifier si le magasin existe
        const store = await prisma.store.findUnique({
            where: { id }
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Magasin non trouvé'
            });
        }

        // 1. Mettre à jour le statut du magasin
        await prisma.store.update({
            where: { id },
            data: {
                status: 'APPROVED',
                isActive: true
            }
        });

        // 2. Vérifier si le badge "verified" existe
        const verifiedBadge = await prisma.badge.findUnique({
            where: { name: 'verified' }
        });

        if (!verifiedBadge) {
            return res.status(404).json({
                success: false,
                message: 'Badge "verified" non trouvé'
            });
        }

        // 3. Attribuer le badge s’il n’a pas encore été attribué
        await prisma.storeBadge.upsert({
            where: {
                storeId_badgeId: {
                    storeId: id,
                    badgeId: verifiedBadge.id
                }
            },
            update: {}, // pas besoin de mise à jour si déjà existant
            create: {
                storeId: id,
                badgeId: verifiedBadge.id
            }
        });

        res.status(200).json({
            success: true,
            message: 'Magasin approuvé et badge vérifié attribué.'
        });
    } catch (error) {
        console.error('[APPROVE STORE ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};