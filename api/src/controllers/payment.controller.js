const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.initiatePayment = async (req, res) => {
    try {
        const user = req.user;
        const { storeId, planId } = req.body;

        // Vérification des entrées
        if (!storeId || !planId) {
            return res.status(400).json({ success: false, message: "storeId et planId sont requis." });
        }

        // Vérifie que la boutique appartient à l'utilisateur
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            return res.status(400).json({ success: false, message: "Boutique non trouvée" });
        }

        if (store.ownerId !== user.id) {
            return res.status(403).json({ success: false, message: "Accès refusé." });
        }

        // Vérifie que le plan existe
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan introuvable." });
        }

        // Créer une entrée de paiement
        const payment = await prisma.payment.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                amount: plan.price,
                currency: plan.currency,
            }
        });

        console.log("Création du paiement:", payment);

        return res.status(200).json({
            success: true,
            message: "Paiement initié.",
            data: payment
            // data: {
            //     paymentId: payment.id,
            //     nextUrl: `/pay/confirm?paymentId=${payment.id}` // ou un lien vers la suite
            // }
        });
    } catch (error) {
        console.error("Erreur lors de l'initiation du paiement:", error);
        return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        console.log("Récupération du paiement avec l'ID:", paymentId);

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Paramètre paymentId manquant"
            });
        }

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        category: true
                    }
                },
                subscription: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        currency: true,
                        duration: true
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Paiement introuvable"
            });
        }

        console.log("Paiement trouvé:", payment);

        return res.status(200).json({
            success: true,
            message: "Paiement trouvé",
            data: payment
        });
    } catch (error) {
        console.log("Erreur lors de la collecte du paiement");
        res.status(500).json({
            success: false,
            message: "Erreur lors de la collecte du paiement",
            error: error.message
        })
    }
};

exports.confirmPayment = async (req, res) => {
    const { paymentId } = req.params;

    if (!paymentId) {
        return res.status(400).json({
            success: false,
            message: "Paramètre paymentId manquant"
        });
    }

    const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: 'COMPLETED',
            updatedAt: new Date()
        }
    });
    res.json({ success: true, data: payment });
};