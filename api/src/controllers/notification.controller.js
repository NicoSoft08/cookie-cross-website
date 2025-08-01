const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.getPublicKey = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Public key retrieved successfully",
            publicKey: process.env.VAPID_PUBLIC_KEY
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la clé publique :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la clé publique." });
    }
};

exports.subscribe = async (req, res) => {
    try {
        const { subscription } = req.body;
        const userId = req.user.id;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, message: "Abonnement invalide" });
        }

        // Évite les doublons
        const alreadyExists = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint }
        });

        if (alreadyExists) {
            return res.status(400).json({ success: false, message: "Cette notification push est déjà enregistrée" });
        }

        // Enregistre l'abonnement
        const newSubscription = await prisma.pushSubscription.create({
            data: {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: userId,
            }
        });

        // Mettre à jour User
        await prisma.user.update({
            where: { id: userId },
            data: {
                pushNotifications: true
            }
        })

        res.status(201).json({ success: true, message: "Abonnement enregistré avec succès", data: newSubscription });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'abonnement :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de l'enregistrement de l'abonnement." });
    }
};

exports.notify = async (req, res) => {
    try {
        const { title, message } = req.body;

        const payload = JSON.stringify({
            title: title || "Notification de test",
            body: message || "Ceci est un test local de notification push.",
        });

        await Promise.all(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error("Erreur lors de l'envoi de la notification push :", err);
                    return null;
                })
            )
        );
        res.status(200).json({ success: true, message: 'Notifications envoyées avec succès' });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification push :", error);
        res.status(500).json({ success: false, message: "Erreur lors de l'envoi de la notification push" });
    }
};

exports.getNotificationByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = [];

        const results = await prisma.notification.findMany({
            where: {
                userId: userId,
                targetType: 'USER',
            },
        });

        if (results.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Aucune notification trouvée"
            });
        }

        notifications.push(results);

        res.status(200).json({
            success: true,
            message: "Notifications trouvées",
            data: {
                notifications,
                unread: notifications.filter((notif) => notif.isRead === true)
            }
        })
    } catch (error) {
        console.error('[GET NOTIFICATION BY USER ID ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};