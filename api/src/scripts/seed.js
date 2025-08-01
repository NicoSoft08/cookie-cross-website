const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const categories = [
    {
        name: 'Mode & Beauté', slug: 'fashion-and-beauty', image: "fashion-and-beauty.png", children: [
            { name: 'Vêtements homme', slug: 'men-clothing' },
            { name: 'Vêtements femme', slug: 'women-clothing' },
            { name: 'Chaussures homme', slug: 'men-shoes' },
            { name: 'Chaussures femme', slug: 'women-shoes' },
            { name: 'Sacs & Accessoires', slug: 'bags-accessories' },
            { name: 'Montres & Bijoux', slug: 'watches-jewelry' },
            { name: 'Cosmétique & Parfums', slug: 'cosmetics-perfumes' }
        ]
    },
    {
        name: 'Immobilier', slug: 'real-estate', image: "real-estate.png", children: [
            { name: 'Vente Maisons', slug: 'house-sale' },
            { name: 'Location Maisons', slug: 'house-rent' },
            { name: 'Location Meublés', slug: 'furnished-rent' },
            { name: 'Appartements', slug: 'apartments' },
            { name: 'Terrains', slug: 'land' },
            { name: 'Bureaux & Commerces', slug: 'office-business' },
            { name: 'Colocation', slug: 'shared-rent' }
        ]
    },
    {
        name: 'Véhicules', slug: 'vehicles', image: "vehicles.png", children: [
            { name: 'Voitures', slug: 'cars' },
            { name: 'Motos & Scooters', slug: 'motorcycles' },
            { name: 'Camions & Bus', slug: 'trucks-buses' },
            { name: 'Accessoires Auto/Moto', slug: 'auto-accessories' },
            { name: 'Pièces détachées', slug: 'car-parts' }
        ]
    },
    {
        name: 'Téléphones & Tablettes', slug: 'phones-tablets', image: "phones-tablets.png", children: [
            { name: 'Smartphones', slug: 'smartphones' },
            { name: 'Tablettes', slug: 'tablets' },
            { name: 'Accessoires téléphonie', slug: 'phone-accessories' },
            { name: 'Téléphones fixes', slug: 'landines' }
        ]
    },
    {
        name: 'Informatique & Électronique', slug: 'electronics', image: "electronics.png", children: [
            { name: 'Ordinateurs portables', slug: 'laptops' },
            { name: 'Ordinateurs de bureau', slug: 'desktops' },
            { name: 'Accessoire PC', slug: 'computer-accessories' },
            { name: 'Télévisions', slug: 'tvs' },
            { name: 'Appareil photo', slug: 'cameras' },
            { name: 'Consoles & Jeux vidéo', slug: 'gaming' },
            { name: 'Imprimantes & Scanners', slug: 'printers' }
        ]
    },
    {
        name: 'Maison & Électroménager', slug: 'home-appliances', image: "home-appliances.png", children: [
            { name: 'Meubles', slug: 'furniture' },
            { name: 'Cuisine & Vaisselle', slug: 'kitchen' },
            { name: 'Lave-linge & Réfrigérateurs', slug: 'laundry-fridge' },
            { name: 'Climatisation & Ventilation', slug: 'air-conditioning' },
            { name: 'Luminaires', slug: 'lighting' },
            { name: 'Décoration', slug: 'decoration' },
        ]
    },
    {
        name: 'Enfants & Bébés', slug: 'kids-baby', image: "kids-baby.png", children: [
            { name: 'Vêtements enfants', slug: 'kids-clothing', image: 'kids-clothing.png' },
            { name: 'Jouets', slug: 'toys', image: 'toys.png' },
            { name: 'Puériculture & Equipements', slug: 'baby-care', image: 'baby-care.png' },
            { name: 'Accessoires scolaires', slug: 'school-accessories', image: 'school-accessories.png' }
        ]
    },
    {
        name: 'Emploi & Services', slug: 'jobs-services', image: "jobs-services.png", children: [
            { name: "Offres d'emploi", slug: 'job-offers' },
            { name: "Demandes d'emploi", slug: 'job-requests' },
            { name: "Cours particuliers", slug: 'private-lessons' },
            { name: "Services à domicile", slug: 'home-services' },
            { name: "Transport & Déménagement", slug: 'moving' },
            { name: "Réparation & Bricolage", slug: 'repair' },
            { name: "Beauté & Bien-être", slug: 'beauty' },
        ]
    },
    {
        name: 'Matériaux & Industrie', slug: 'industrial', image: "industrial.png", children: [
            { name: 'Matériaux de construction', slug: 'construction' },
            { name: 'Équipements industriels', slug: 'equipment' },
            { name: 'Machines & Outils', slug: 'tools' },
            { name: 'Fournitures agricoles', slug: 'agriculture' }
        ]
    },
    {
        name: 'Animaux', slug: 'pets', image: "pets.png", children: [
            { name: 'Chiens & Chats', slug: 'dogs-cats' },
            { name: 'Oiseaux & Rongeurs', slug: 'birds-rodents' },
            { name: 'Accessoires pour animaux', slug: 'pet-accessories' },
            { name: 'Autres animaux', slug: 'other-pets' }
        ]
    },
    {
        name: 'Loisirs & Divertissement', slug: 'leisure', image: "leisure.png", children: [
            { name: 'Livres & Magazines', slug: 'books' },
            { name: 'Instruments de musique', slug: 'music' },
            { name: 'Billetterie & Événements', slug: 'tickets-events' },
            { name: 'Art & Artisanat', slug: 'art' },
            { name: 'Sports & Fitness', slug: 'sports' }
        ]
    },
    {
        name: 'Alimentation & Nutrition', slug: 'food-and-nutrition', image: "food-and-nutrition.png", children: [
            { name: 'Produits frais', slug: 'fresh-products' },
            { name: 'Épicerie', slug: 'grocery' },
            { name: 'Boissons', slug: 'drinks' },
            { name: 'Compléments alimentaires', slug: 'dietary-supplements' },
            { name: 'Produits faits maison', slug: 'homemade-products' }
        ]
    }
];

const packs = [
    {
        slug: 'mini', name: 'Mini', price: 300, extraImages: 2, listings: 1, durationDays: 7, description: 'Parfait pour commencer', features: [
            '+2 photos supplémentaires',
            '1 annonce concernée',
            'Valable 7 jours',
            'Support client'
        ], icon: 'Camera', color: 'blue', popular: false
    },
    {
        slug: 'boost', name: 'Boost', price: 500, extraImages: 3, listings: 1, durationDays: 15, description: 'Le plus populaire', features: [
            '+3 photos supplémentaires',
            '1 annonce concernée',
            'Valable 15 jours',
            'Support prioritaire',
            'Mise en avant'
        ], icon: 'Zap', color: 'purple', popular: true
    },
    {
        slug: 'unlimited', name: 'Illimité', price: 1500, extraImages: 'unlimited', listings: 5, durationDays: 30, description: 'Pour les professionnels', features: [
            'Photos illimitées',
            '5 annonces concernées',
            'Valable 30 jours',
            'Support VIP',
            'Analytics avancées',
            'Badge premium'
        ], icon: 'Crown', color: 'gold', popular: false
    }
];

exports.main = async () => {
    try {
        // Vérifier si le super admin existe déjà
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });

        console.log('🌱 Vérification du super admin...', existingSuperAdmin);

        if (!existingSuperAdmin) {
            // Créer le super admin par défaut
            const superAdmin = await prisma.user.create({
                data: {
                    email: process.env.SUPER_ADMIN_EMAIL,
                    password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12),
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    emailVerified: true,
                }
            });

            console.log('✅ Super Admin créé:', {
                id: superAdmin.id,
                email: superAdmin.email,
                name: `${superAdmin.firstName} ${superAdmin.lastName}`,
                role: superAdmin.role
            });
        } else {
            console.log('ℹ️  Super Admin existe déjà');
        }

        // Créer les plans d'abonnement

        const pricingPlans = [
            // Mensuel
            {
                name: "Gratuit",
                slug: "free-monthly",
                description: "Plan gratuit avec fonctionnalités de base",
                price: 0,
                billingCycle: "monthly",
                maxListings: 3,
                maxPhotosPerListing: 3,
                listingDurationDays: 30,
                features: [
                    '3 annonces actives maximum',
                    '3 photos par annonce',
                    'Support standard',
                ],
                order: 1
            },
            {
                name: "Basic",
                slug: "basic-monthly",
                description: "Plan basic pour utilisateurs réguliers",
                price: 9.99,
                billingCycle: "monthly",
                maxListings: 10,
                maxPhotosPerListing: 8,
                maxVideosPerListing: 1,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    '10 annonces actives',
                    '8 photos par annonce',
                    '1 vidéo par annonce',
                    'Support prioritaire',
                ],
                order: 2
            },
            {
                name: "Premium",
                slug: "premium-monthly",
                description: "Plan premium avec fonctionnalités avancées",
                price: 19.99,
                billingCycle: "monthly",
                maxListings: 10,
                maxPhotosPerListing: 8,
                maxVideosPerListing: 1,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    '60 annonces actives',
                    '15 photos par annonce',
                    '3 vidéos par annonce',
                    'Analytique avancée',
                    'Support 24/7',
                ],
                order: 3
            },
            {
                name: "Pro",
                slug: "pro-monthly",
                description: 'Plan professionnel pour entreprises',
                price: 29.99,
                billingCycle: "monthly",
                maxListings: 0,
                maxPhotosPerListing: 30,
                maxVideosPerListing: 5,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    '60 annonces actives',
                    '15 photos par annonce',
                    '3 vidéos par annonce',
                    'Analytique avancée',
                    'Support 24/7',
                ],
                order: 4
            },
            // ... autres plans mensuels

            // Annuel
            {
                name: "Basic",
                slug: "basic-yearly",
                description: "Plan basic annuel (économisez 20%)",
                price: 95.99, // 9.99 * 12 * 0.8
                originalPrice: 119.88,
                billingCycle: "yearly",
                duration: 365,
                maxListings: 10,
                maxPhotosPerListing: 8,
                maxVideosPerListing: 1,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    '10 annonces actives',
                    '8 photos par annonce',
                    '1 vidéo par annonce',
                    'Support prioritaire',
                ],
                order: 5
            },
            {
                name: "Premium",
                slug: "premium-yearly",
                description: 'Plan premium annuel (économisez 25%)',
                price: 179.99, // 19.99 * 12 * 0.75
                originalPrice: 239.88,
                billingCycle: "yearly",
                duration: 365,
                maxListings: 10,
                maxPhotosPerListing: 8,
                maxVideosPerListing: 1,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    '10 annonces actives',
                    '8 photos par annonce',
                    '1 vidéo par annonce',
                    'Support prioritaire',
                ],
                order: 6
            },
            {
                name: "Pro",
                slug: "pro-yearly",
                description: 'Plan pro annuel (économisez 30%)',
                price: 251.99, // 29.99 * 12 * 0.7
                originalPrice: 359.88,
                billingCycle: "yearly",
                duration: 365,
                maxListings: 10,
                maxPhotosPerListing: 30,
                maxVideosPerListing: 1,
                listingDurationDays: 30,
                hasPrioritySupport: true,
                features: [
                    'Annonces illimitées',
                    '30 photos par annonce',
                    '5 vidéos par annonce',
                    'Analytique premium',
                    'Consultant dédié',
                ],
                order: 7
            },
            // ... autres plans annuels
        ];

        console.log('🌱 Création des plans d\'abonnement...');

        // Créer des utilisateurs de test
        const  testUsers = [
            {
                email: 'admin@adscity.com',
                password: await bcrypt.hash('MyAdminPassword123@!', 10),
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                emailVerified: true,
            },
            {
                email: 'moderator@adscity.com',
                password: await bcrypt.hash('MyModeratorPassword123@!', 10),
                firstName: 'Moderator',
                lastName: 'User',
                role: 'MODERATOR',
                emailVerified: true,
            },
            {
                email: 'user@adscity.com',
                password: await bcrypt.hash('MyUserPassword123@!', 10),
                firstName: 'Regular',
                lastName: 'User',
                role: 'USER',
                emailVerified: true,
            }
        ];

        for (const category of categories) {
            // Check if category already exists
            const existingCategory = await prisma.listingCategory.findUnique({
                where: { slug: category.slug }
            });

            if (!existingCategory) {
                const parent = await prisma.listingCategory.create({
                    data: {
                        name: category.name,
                        slug: category.slug,
                        image: category.image
                    }
                });

                for (const child of category.children) {
                    const existingChild = await prisma.listingCategory.findUnique({
                        where: { slug: child.slug }
                    });

                    if (!existingChild) {
                        await prisma.listingCategory.create({
                            data: {
                                name: child.name,
                                slug: child.slug,
                                image: child.image,
                                parentId: parent.id
                            }
                        });
                    }
                }
            }
        }

        for (const userData of testUsers) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (!existingUser) {
                const user = await prisma.user.create({
                    data: userData
                });
                console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
            }
        }

        for (const pack of packs) {
            const existingPack = await prisma.photoPack.findUnique({
                where: { slug: pack.slug }
            });

            if (!existingPack) {
                await prisma.photoPack.create({
                    data: pack
                })
            }
        };

        // await prisma.pricing.createMany({ data: pricingPlans });

        console.log('🎉 Seed terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du seed:', error);
        throw error;
    }
}