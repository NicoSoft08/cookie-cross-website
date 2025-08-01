const { name } = require("ejs");
const ActivityTypes = require("../constants/activityTypes");
const NotificationTypes = require("../constants/notificationTypes");
const { PrismaClient } = require("../generated/prisma");
const ActivityService = require("../services/activity.service");
const NotificationService = require("../services/notification.service");
const cloudinary = require('cloudinary').v2;
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../utils/slugify");
const storeSchema = require("../validators/storeValidator");

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getStores = async (req, res) => {
    try {
        const stores = await prisma.store.findMany({
            where: {
                isActive: true,
                status: 'APPROVED', // Assurez-vous que la boutique est approuvée
            },
            select: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
                banner: true,
                category: true,
                description: true,
                followers: true,
                likes: true,
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
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        listings: true,
                        followers: true,
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
                message: 'Aucune boutique trouvée',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Boutiques récupérées avec succès',
            data: stores.map(store => ({
                ...store,
                likesCount: store._count.likes // 👈 renommer pour clarté côté frontend
            }))
        });
    } catch (error) {
        console.error('[ GET STORES ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

exports.createStore = async (req, res) => {
    try {
        const avatarFile = req.files?.avatar?.[0];
        const bannerFile = req.files?.banner?.[0];
        const { name, category, description } = req.body;

        // 🔐 Validation
        const parsed = storeSchema.safeParse({ name, category, description });
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Champs invalides',
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        // 🔁 Vérifier si le propriétaire a déjà une boutique
        const existingStore = await prisma.store.findUnique({ where: { ownerId: req.user.id } });
        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: 'Vous avez déjà une boutique.',
            });
        }

        // 🧠 Générer un slug unique
        const slug = await generateUniqueSlug(name, prisma);

        // ⬆️ Upload Cloudinary
        let avatarUrl = null;
        let bannerUrl = null;

        if (avatarFile) {
            const avatarUpload = await uploadToCloudinary(avatarFile.buffer);
            avatarUrl = avatarUpload.secure_url;
        }

        if (bannerFile) {
            const bannerUpload = await uploadToCloudinary(bannerFile.buffer);
            bannerUrl = bannerUpload.secure_url;
        }

        // 🏗️ Création de la boutique
        const newStore = await prisma.store.create({
            data: {
                name,
                category,
                slug,
                description,
                ownerId: req.user.id, // supposé sûr via middleware JWT/session
                avatar: avatarUrl,
                banner: bannerUrl,
                isVerified: false,
                status: 'PENDING',
            },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                storeId: newStore.id, // Lier la boutique à l'utilisateur
                storeLikes: {
                    create: {
                        storeId: newStore.id, // Créer une entrée de like pour la boutique
                    }
                }
            }
        });

        // 📬 Notification à l'administrateur
        const admin = await prisma.user.findFirst({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'],
                },
            },
        });

        if (admin) {
            await NotificationService.createNotification(
                'USER',
                admin.id,
                NotificationTypes.NEW_STORE,
                `Une nouvelle boutique a été créée : ${newStore.name}`,
                { storeId: newStore.id, adminId: admin.id }
            );
        };

        // 📬 Notification à l'utilisateur
        await NotificationService.createNotification(
            'USER',
            req.user.id,
            NotificationTypes.STORE_CREATED,
            `Votre boutique "${newStore.name}" a été créée avec succès et est en attente de validation.`,
            { storeId: newStore.id }
        );

        return res.status(200).json({
            success: true,
            message: 'Boutique créée avec succès',
            data: newStore,
        });
    } catch (error) {
        console.error('[CREATE STORE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.getStoreBySlug = async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: { slug: req.params.slug },
            select: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
                banner: true,
                description: true,
                category: true,
                isVerified: true,
                ownerId: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        likes: true,
                        listings: true,
                    },
                },
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: store.ownerId,
                storeId: store.id,
            },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Boutique récupérée avec succès',
            data: {
                ...store,
                ...user, // Inclure les informations de l'utilisateur
                likesCount: store._count.likes // 👈 renommer pour clarté côté frontend
            }
        });
    } catch (error) {
        console.error('[GET STORE BY SLUG ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: { id: req.params.id }
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Boutique récupérée avec succès',
            data: store
        });
    } catch (error) {
        console.error('[GET STORE BY ID ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.getStoreListings = async (req, res) => {
    try {
        const storeId = req.params.id;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'ID de la boutique manquant',
            });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        const listings = await prisma.listing.findMany({
            where: { storeId: storeId },
            select: {
                details: true,
                location: true,
                category: true,
                subcategory: true,
                images: true,
                isActive: true,
                status: true,
                createdAt: true,
                store: {
                    select: {
                        name: true,
                        slug: true,
                        avatar: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
            success: true,
            message: 'Annonces récupérées avec succès',
            data: listings,
        });

    } catch (error) {
        console.error('[GET STORE LISTINGS ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.getStoreByUserId = async (req, res) => {
    const { userId } = req.params;
    const user = req.user;

    // 🧠 Vérification de l'ID utilisateur
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'ID utilisateur manquant',
        });
    }

    // 🔐 Vérification de l'utilisateur
    if (user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: 'Accès non autorisé',
        });
    }

    try {
        const store = await prisma.store.findUnique({
            where: { ownerId: userId },
            select: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
                banner: true,
                description: true,
                category: true,
                isVerified: true,
                isActive: true,
                status: true,
                createdAt: true,
                likes: true,
                badges: true,
                _count: {
                    select: {
                        likes: true,
                        listings: true,
                    },
                }
            }
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Aucune boutique trouvée pour cet utilisateur',
            });
        }

        // Récupérer les informations de l'utilisateur
        const userInfo = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                isActive: true,
                email: true,
                avatar: true,
                role: true,
                storeId: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!userInfo) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Boutique récupérée avec succès',
            data: {
                ...store,
                user: userInfo
            }
        });
    } catch (error) {
        console.error('[GET STORE BY USER ID ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.followStore = async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: {
                id: req.params.id
            },
        });

        console.log(store);

        if (!store) {
            console.log('Store not found');
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        // Le propriétaire de la boutique ne peut pas la suivre
        if (store.ownerId === req.user.id) {
            console.log('Owner cannot follow their own store');
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas suivre votre propre boutique.',
            });
        }

        // Vérifier si l'utilisateur suit déjà la boutique
        const existingStore = await prisma.storeFollower.findFirst({
            where: {
                userId: req.user.id,
                storeId: store.id,
            }
        });

        if (existingStore) {
            console.log('User already follows this store');
            return res.status(400).json({
                success: false,
                message: 'Vous suivez déjà cette boutique.',
            });
        }

        // Ajouter l'utilisateur à la liste des abonnés de la boutique
        const newFollower = await prisma.storeFollower.create({
            data: {
                userId: req.user.id,
                storeId: store.id,
                followedAt: new Date(),
            }
        });

        // 📬 Notification au propriétaire de la boutique
        await NotificationService.createNotification(
            'USER',
            store.ownerId,
            NotificationTypes.STORE_FOLLOWED,
            `L'utilisateur ${req.user.firstName} ${req.user.lastName} a commencé à suivre votre boutique "${store.name}".`,
            { storeId: store.id, followerId: newFollower.id }
        );

        // 📬 Notification à l'utilisateur
        await NotificationService.createNotification(
            'USER',
            req.user.id,
            NotificationTypes.STORE_FOLLOWED,
            `Vous suivez maintenant la boutique "${store.name}".`,
            { storeId: store.id, followerId: newFollower.id }
        );

        await ActivityService.logActivity(
            user.id,
            ActivityTypes.STORE_LIKED,
            {
                store: {
                    name: store.name
                }
            }
        )

        res.status(200).json({
            success: true,
            message: 'Boutique suivie avec succès',
            data: {
                ...store,
                followerId: newFollower.id, // ID du nouveau follower
            }
        });
    } catch (error) {
        console.error('[FOLLOW STORE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.unfollowStore = async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: { id: req.params.id },
        })

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        // Vérifier si l'utilisateur suit déjà la boutique
        const existingFollower = await prisma.storeFollower.findFirst({
            where: {
                userId: req.user.id,
                storeId: store.id,
            }
        });
        if (!existingFollower) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne suivez pas cette boutique.',
            });
        }
        // Supprimer l'utilisateur de la liste des abonnés de la boutique
        await prisma.storeFollower.delete({
            where: {
                id: existingFollower.id,
            }
        });

        // 📬 Notification au propriétaire de la boutique
        await NotificationService.createNotification(
            'USER',
            store.ownerId,
            NotificationTypes.STORE_UNFOLLOWED,
            `L'utilisateur ${req.user.firstName} ${req.user.lastName} a arrêté de suivre votre boutique "${store.name}".`,
            { storeId: store.id, followerId: existingFollower.id }
        );

        // 📬 Notification à l'utilisateur
        await NotificationService.createNotification(
            'USER',
            req.user.id,
            NotificationTypes.STORE_UNFOLLOWED,
            `Vous ne suivez plus la boutique "${store.name}".`,
            { storeId: store.id, followerId: existingFollower.id }
        );

        res.status(200).json({
            success: true,
            message: 'Boutique non suivie avec succès',
            data: {
                ...store,
                followerId: null, // L'utilisateur n'est plus un follower
            }
        });
    } catch (error) {
        console.error('[UNFOLLOW STORE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.likeStore = async (req, res) => {
    const id = req.params.id;

    try {
        const store = await prisma.store.findUnique({
            where: { id: id },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        // Vérifie si l'utilisateur a déjà liké
        const existingLike = await prisma.storeLike.findUnique({
            where: {
                userId_storeId: {
                    userId: req.user.id,
                    storeId: id,
                },
            },
        });

        if (existingLike) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà liké cette boutique.',
            });
        }

        // Crée le like
        await prisma.storeLike.create({
            data: {
                userId: req.user.id,
                storeId: id,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Boutique likée avec succès.',
        });

    } catch (error) {
        console.error('[LIKE STORE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.unlikeStore = async (req, res) => {
    const userId = req.user.id;
    const storeId = req.params.id;

    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        // Vérifie si l'utilisateur a déjà liké
        const existingLike = await prisma.storeLike.findUnique({
            where: {
                userId_storeId: {
                    userId: userId,
                    storeId: storeId,
                },
            },
        });

        if (!existingLike) {
            return res.status(400).json({
                success: false,
                message: 'Vous n’avez pas encore liker cette boutique.',
            });
        }

        // Supprimer le like
        await prisma.storeLike.delete({
            where: {
                userId_storeId: {
                    userId: userId,
                    storeId: storeId,
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Like retiré avec succès.',
        });
    } catch (error) {
        console.error('[DISLIKE STORE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};

exports.incrementStoreVisit = async (req, res) => {
    const userId = req.user.id;
    const storeId = req.params.id;

    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
            });
        }

        const recentVisit = await prisma.storeVisit.findFirst({
            where: {
                storeId: storeId,
                userId: userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 60 * 1000) // 30 mins

                }
            }
        })

        if (recentVisit) {
            return res.status(200).json({ success: true, message: "Visite déjà enregistrée récemment" });
        }

        await prisma.storeVisit.create({
            data: {
                storeId,
                userId,
                city: req.user.city,
                country: req.user.country
            }
        });

        res.json({ success: true, message: "Visite enregistrée avec succès" });
    } catch (error) {
        console.error('[INCREASE STORE VISITS ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
}