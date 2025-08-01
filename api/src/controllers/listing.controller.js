const { PrismaClient } = require("../generated/prisma");
const { verifyCaptcha } = require("../middlewares/auth.middleware");

const prisma = new PrismaClient();

exports.getListings = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                status: 'APPROVED',
                isActive: true,
                moderationStatus: 'APPROVED'
            },
            select: {
                id: true,
                details: true,
                category: true,
                subcategory: true,
                images: true,
                status: true,
                audience: true,
                isActive: true,
                isSold: true,
                isSponsored: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                storeId: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        banner: true,
                        description: true,
                        category: true,
                        slug: true,
                        badges: true,
                        likes: true,
                        followers: true,
                        isActive: true,
                        isVerified: true,
                    }
                }
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
                badges: true,
                likes: true,
                followers: true,
                isActive: true,
                isVerified: true,
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
                id: req.params.id
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

exports.searchListing = async (req, res) => {
    try {
        const {
            q = '',
            location = '',
            category = '',
            subcategory = '',
            sortBy = 'relevance',
            page = 1,
            limit = 20
        } = req.query;

        const normalizedQuery = q.trim().toLowerCase();
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Construction dynamique de la clause WHERE
        let whereConditions = [];
        let values = [];
        let valueIndex = 1;

        // Conditions de base (toujours présentes)
        whereConditions.push(`
            l."status" = 'APPROVED'
            AND l."isActive" = true
            AND l."moderationStatus" = 'APPROVED'
        `);

        // Ajout des conditions en fonction des paramètres
        if (normalizedQuery) {
            whereConditions.push(`
                (
                    l."searchableTerms"::text ILIKE $${valueIndex} OR
                    l.details->>'title' ILIKE $${valueIndex} OR
                    l.details->>'description' ILIKE $${valueIndex} OR
                    l."category" ILIKE $${valueIndex} OR
                    l."subcategory" ILIKE $${valueIndex}
                )
            `);
            values.push(`%${normalizedQuery}%`);
            valueIndex++;
        }

        if (category) {
            whereConditions.push(`l."category" = $${valueIndex}`);
            values.push(category);
            valueIndex++;
        }

        if (subcategory) {
            whereConditions.push(`l."subcategory" = $${valueIndex}`);
            values.push(subcategory);
            valueIndex++;
        }

        // Tri
        let orderClause = 'ORDER BY l."createdAt" DESC';
        switch (sortBy) {
            case 'date_asc':
                orderClause = 'ORDER BY l."createdAt" ASC';
                break;
            case 'price_asc':
                orderClause = 'ORDER BY (l.details->>\'price\')::numeric ASC';
                break;
            case 'price_desc':
                orderClause = 'ORDER BY (l.details->>\'price\')::numeric DESC';
                break;
        }

        // Requête principale
        values.push(take, skip);
        const query = `
            SELECT l.*, 
                (
                    SELECT json_agg(i.*)
                    FROM "ad_images" i
                    WHERE i."listingId" = l.id
                ) AS images
            FROM "listings" l
            WHERE ${whereConditions.join(' AND ')}
            ${orderClause}
            LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
        `;

        const listings = await prisma.$queryRawUnsafe(query, ...values);

        // Comptage total
        const countQuery = `
            SELECT COUNT(*) FROM "listings" l
            WHERE ${whereConditions.join(' AND ')}
        `;
        const countResult = await prisma.$queryRawUnsafe(countQuery, ...values.slice(0, valueIndex - 1));
        const total = parseInt(countResult[0].count);

        // Récupération des boutiques (comme dans votre code original)
        const storeIds = [...new Set(listings.map(l => l.storeId).filter(Boolean))];
        const stores = await prisma.store.findMany({
            where: { id: { in: storeIds } },
            select: {
                id: true,
                name: true,
                avatar: true,
                banner: true,
                description: true,
                slug: true,
                category: true,
                badges: true,
                likes: true,
                followers: true,
                isActive: true,
                isVerified: true
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
            total,
            hasMore: skip + listings.length < total,
            message: listings.length > 0
                ? 'Résultats récupérés avec succès.'
                : 'Aucune annonce trouvée.'
        });

    } catch (error) {
        console.error('[SEARCH ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const updatedListing = await prisma.listing.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: req.body
        });

        res.status(200).json({
            data: updatedListing,
            message: 'Annonce mise à jour avec succès.'
        });
    } catch (error) {
        console.error('[UPDATE LISTING ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.createListing = async (req, res) => {
    const { postData, captchaValue } = req.body;

    if (!postData || typeof postData !== 'object') {
        return res.status(400).json({
            success: false,
            message: "Données d'annonce manquantes ou invalides",
        });
    }

    const { category, subcategory, details, images, location, searchableTerms } = postData;

    // ✅ Vérification CAPTCHA
    if (!captchaValue) {
        return res.status(400).json({
            success: false,
            message: "Vérification CAPTCHA requise",
        });
    }

    const captchaVerification = await verifyCaptcha(captchaValue);
    if (!captchaVerification.success) {
        return res.status(400).json({
            success: false,
            message: "CAPTCHA invalide",
        });
    }


    try {
        // ✅ Vérification l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        // ✅ Vérification de l'activité de l'utilisateur
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Vous ne pouvez pas créer d'annonces tant que votre compte n'est pas activé.",
            });
        }

        // ✅ Vérification de l'email de l'utilisateur
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Vous ne pouvez pas créer d'annonces tant que votre email n'est pas vérifié.",
            });
        }

        // ✅ Vérification du magasin de l'utilisateur
        const store = await prisma.store.findUnique({
            where: { ownerId: req.user.id },
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Boutique non trouvée pour cet utilisateur",
            });
        }

        // ✅ Vérification de l'approbation de la boutique
        if (store.status !== 'APPROVED') {
            return res.status(403).json({
                success: false,
                message: "Vous ne pouvez pas créer d'annonces tant que votre boutique n'est pas approuvée.",
            });
        }

        // ✅ Vérification de l'activité de la boutique
        if (!store.isActive) {
            return res.status(403).json({
                success: false,
                message: "Vous ne pouvez pas créer d'annonces tant que votre boutique n'est pas active.",
            });
        }

        const newListing = await prisma.listing.create({
            data: {
                category,
                subcategory,
                details,
                location,
                searchableTerms,
                status: 'PENDING',
                store: {
                    connect: {
                        id: store.id
                    }
                }
            }
        });

        if (!newListing) {
            return res.status(400).json({ success: false, message: 'Erreur lors de la création de l\'annonce.' });
        }

        // ✅ Sauvegarde de la première image (si disponible)
        if (Array.isArray(images) && images.length > 0) {
            const imageRecords = await Promise.all(
                images.map((imgUrl, index) =>
                    prisma.listingImage.create({
                        data: {
                            listingId: newListing.id,
                            userId: req.user.id,
                            isMain: index === 0, // la première image est l’image principale
                            thumbnails: JSON.stringify({ original: imgUrl }),
                            order: index,
                        }
                    })
                )
            );
        }

        res.status(201).json({
            success: true,
            data: newListing,
            message: 'Annonce créée avec succès.'
        });
    } catch (error) {
        console.error('[CREATE LISTING ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.updateShareCount = async (req, res) => {
    const city = req.user.city;

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Annonce non trouvée.' });
        }

        // Étape 1 — Ajouter une ligne dans le modèle Share
        const share = await prisma.share.create({
            data: {
                listingId: listing.id,
                userId: req.user.id,
                city: city
            },
        })

        // Étape 2 — Mettre à jour shares_per_city (objet JSON)
        const sharesPerCity = listing.shares_per_city || {};
        const currentCount = sharesPerCity[city] || 0;
        sharesPerCity[city] = currentCount + 1;

        await prisma.listing.update({
            where: { id: req.params.id },
            data: {
                shares: {
                    increment: 1
                },
                shares_per_city: sharesPerCity
            }
        });

        res.status(200).json({
            success: true,
            message: 'Partage enregistré.',
            data: share
        });
    } catch (error) {
        console.error('[SHARE LISTING ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.reportListing = async (req, res) => {
    const { reason } = req.body;
    try {
        // Vérification de l'existence de l'annonce
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Le propriétaire ne peut pas signaler l'annonce qui appartient à sa propre boutique
        if (listing.storeId === req.user.storeId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez pas signaler votre propre annonce.'
            });
        }

        // Création du signalement
        await prisma.report.create({
            data: {
                listingId: listing.id,
                reporterId: req.user.id,
                reason: reason
            }
        });

    } catch (error) {
        console.error('[REPORT LISTING ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.incrementViewCount = async (req, res) => {
    const city = req.user.city;

    try {
        // Vérifier si l'annonce existe
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Vérifier si l'utilisateur a déjà vu cette annonce
        const recentView = await prisma.listingView.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 60 * 1000),
                },
            }
        })

        if (recentView) {
            return res.status(200).json({
                success: true,
                message: "Vue déjà enregistrée récemment"
            });
        }

        // Enregistrer la vue
        await prisma.listingView.create({
            data: {
                listingId: listing.id,
                userId: req.user.id,
                city: req.user.city,
                country: req.user.country

            },
        });


        res.status(200).json({
            success: true,
            message: 'Vue enregistrée.',
        });

    } catch (error) {
        console.error('[INCREMENT LISTING VIEWS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.incrementClickCount = async (req, res) => {
    try {
        // Vérifier si l'annonce existe
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Vérifier si l'utilisateur a déjà cliqué cette annonce
        const recentClick = await prisma.listingClick.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 60 * 1000),
                },
            }
        })

        if (recentClick) {
            return res.status(200).json({
                success: true,
                message: "Vue déjà enregistrée récemment"
            });
        }

        // Enregistrer le click
        await prisma.listingClick.create({
            data: {
                listingId: listing.id,
                userId: req.user.id,
                city: req.user.city,
                country: req.user.country

            },
        });

        res.status(200).json({
            success: true,
            message: 'Vue enregistrée.',
        });

    } catch (error) {
        console.error('[INCREMENT LISTING CLICKS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
}

exports.addFavorite = async (req, res) => {
    try {
        // Vérifier si l'annonce existe
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Vérifier si l'utilisateur a déjà ajouté l'annonce aux favoris
        const favorite = await prisma.favorite.findFirst({
            where: {
                listingId: listing.id,
                userId: req.user.id
            }
        });

        if (!favorite) {
            // Ajouter l'annonce aux favoris
            await prisma.favorite.create({
                data: {
                    listingId: listing.id,
                    userId: req.user.id
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Annonce ajoutée aux favoris.'
        });
    } catch (error) {
        console.error('[ADD FAVORITE ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        // Vérifier si l'annonce existe
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Annonce non trouvée.'
            });
        }

        // Vérifier si l'utilisateur a déjà ajouté l'annonce aux favoris
        const favorite = await prisma.favorite.findFirst({
            where: {
                listingId: listing.id,
                userId: req.user.id
            }
        });

        if (favorite) {
            // Supprimer l'annonce aux favoris
            await prisma.favorite.delete({
                data: {
                    listingId: listing.id,
                    userId: req.user.id
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Annonce supprimée favoris.'
        });
    } catch (error) {
        console.error('[REMOVE FAVORITE ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};