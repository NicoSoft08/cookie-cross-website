const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.requireStore = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur introuvable.' });
        }

        const store = await prisma.store.findUnique({
            where: {
                ownerId: user.id
            }
        });

        if (!store) {
            return res.status(403).json({
                success: false,
                message: "Vous devez créer une boutique avant de publier une annonce."
            });
        }

        // Stocke la boutique dans la requête si besoin
        req.store = store;

        next();
    } catch (error) {
        console.error('Erreur middleware requireStore:', error);
        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur."
        });
    }
}