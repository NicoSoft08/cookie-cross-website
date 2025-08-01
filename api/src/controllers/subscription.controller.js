const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class SubscriptionService {

    /**
   * Créer un nouvel abonnement
   */
    static async createSubscription(userId, planId, paymentData = {}) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { currentSubscription: true }
            });

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id: planId }
            });

            if (!plan || !plan.isActive) {
                throw new Error('Plan d\'abonnement non disponible');
            }

            // Calculer les dates
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

            // Créer l'abonnement
            const subscription = await prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    amount: plan.price,
                    currency: plan.currency,
                    startDate,
                    endDate,
                    status: plan.price === 0 ? 'ACTIVE' : 'PENDING',
                    autoRenew: true
                },
                include: {
                    plan: true,
                    user: true
                }
            });

            // Créer le paiement si nécessaire
            if (plan.price > 0) {
                await prisma.payment.create({
                    data: {
                        userId,
                        subscriptionId: subscription.id,
                        amount: plan.price,
                        currency: plan.currency,
                        status: 'PENDING',
                        paymentMethod: paymentData.method || 'card',
                        metadata: paymentData.metadata || {}
                    }
                });
            }

            // Mettre à jour l'abonnement actuel de l'utilisateur
            if (subscription.status === 'ACTIVE') {
                await this.activateSubscription(subscription.id);
            }

            return {
                success: true,
                subscription,
                message: 'Abonnement créé avec succès'
            };

        } catch (error) {
            console.error('Erreur lors de la création de l\'abonnement:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Activer un abonnement
   */
    static async activateSubscription(subscriptionId) {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
                include: { user: true, plan: true }
            });

            if (!subscription) {
                throw new Error('Abonnement non trouvé');
            }

            // Désactiver l'ancien abonnement
            if (subscription.user.currentSubscriptionId) {
                await prisma.subscription.update({
                    where: { id: subscription.user.currentSubscriptionId },
                    data: { status: 'CANCELLED' }
                });
            }

            // Activer le nouveau
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'ACTIVE' }
            });

            // Mettre à jour l'utilisateur
            await prisma.user.update({
                where: { id: subscription.userId },
                data: { currentSubscriptionId: subscriptionId }
            });

            // Envoyer email de confirmation
            await emailService.sendSubscriptionActivated(
                subscription.user.email,
                subscription.plan.name,
                subscription.endDate
            );

            return {
                success: true,
                message: 'Abonnement activé avec succès'
            };

        } catch (error) {
            console.error('Erreur lors de l\'activation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Upgrade/Downgrade d'abonnement
   */
    static async changeSubscription(userId, newPlanId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    currentSubscription: {
                        include: { plan: true }
                    }
                }
            });

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            const newPlan = await prisma.subscriptionPlan.findUnique({
                where: { id: newPlanId }
            });

            if (!newPlan || !newPlan.isActive) {
                throw new Error('Nouveau plan non disponible');
            }

            const currentSubscription = user.currentSubscription;

            if (!currentSubscription) {
                // Pas d'abonnement actuel, créer un nouveau
                return await this.createSubscription(userId, newPlanId);
            }

            if (currentSubscription.planId === newPlanId) {
                return {
                    success: false,
                    message: 'Vous avez déjà ce plan d\'abonnement'
                };
            }

            // Calculer le prorata si upgrade
            const now = new Date();
            const remainingDays = Math.max(0,
                Math.ceil((currentSubscription.endDate - now) / (1000 * 60 * 60 * 24))
            );

            let prorataAmount = 0;
            if (newPlan.price > currentSubscription.plan.price && remainingDays > 0) {
                const dailyDifference = (newPlan.price - currentSubscription.plan.price) / newPlan.duration;
                prorataAmount = dailyDifference * remainingDays;
            }

            // Annuler l'ancien abonnement
            await prisma.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: now
                }
            });

            // Créer le nouvel abonnement
            const endDate = new Date(now.getTime() + newPlan.duration * 24 * 60 * 60 * 1000);

            const newSubscription = await prisma.subscription.create({
                data: {
                    userId,
                    planId: newPlanId,
                    amount: Math.max(0, prorataAmount),
                    currency: newPlan.currency,
                    startDate: now,
                    endDate,
                    status: prorataAmount > 0 ? 'PENDING' : 'ACTIVE',
                    autoRenew: currentSubscription.autoRenew
                },
                include: { plan: true }
            });

            // Créer le paiement si nécessaire
            if (prorataAmount > 0) {
                await prisma.payment.create({
                    data: {
                        userId,
                        subscriptionId: newSubscription.id,
                        amount: prorataAmount,
                        currency: newPlan.currency,
                        status: 'PENDING',
                        paymentMethod: 'card'
                    }
                });
            } else {
                // Activer immédiatement si gratuit ou downgrade
                await this.activateSubscription(newSubscription.id);
            }

            return {
                success: true,
                subscription: newSubscription,
                prorataAmount,
                message: newPlan.price > currentSubscription.plan.price ?
                    'Upgrade effectué avec succès' : 'Downgrade effectué avec succès'
            };

        } catch (error) {
            console.error('Erreur lors du changement d\'abonnement:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Annuler un abonnement
   */
    static async cancelSubscription(userId, immediate = false) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    currentSubscription: {
                        include: { plan: true }
                    }
                }
            });

            if (!user || !user.currentSubscription) {
                throw new Error('Aucun abonnement actif trouvé');
            }

            const subscription = user.currentSubscription;
            const now = new Date();

            if (immediate) {
                // Annulation immédiate
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'CANCELLED',
                        cancelledAt: now,
                        endDate: now,
                        autoRenew: false
                    }
                });

                // Passer au plan gratuit
                const freePlan = await prisma.subscriptionPlan.findFirst({
                    where: { slug: 'free' }
                });

                if (freePlan) {
                    await this.createSubscription(userId, freePlan.id);
                }

                await emailService.sendSubscriptionCancelled(
                    user.email,
                    subscription.plan.name,
                    true
                );

            } else {
                // Annulation à la fin de la période
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        autoRenew: false,
                        cancelledAt: now
                    }
                });

                await emailService.sendSubscriptionCancelled(
                    user.email,
                    subscription.plan.name,
                    false,
                    subscription.endDate
                );
            }

            return {
                success: true,
                message: immediate ?
                    'Abonnement annulé immédiatement' :
                    'Abonnement sera annulé à la fin de la période'
            };

        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Renouveler automatiquement les abonnements
   */
    static async renewSubscriptions() {
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Trouver les abonnements qui expirent demain et qui ont le renouvellement automatique
            const expiringSubscriptions = await prisma.subscription.findMany({
                where: {
                    status: 'ACTIVE',
                    autoRenew: true,
                    endDate: {
                        gte: now,
                        lte: tomorrow
                    }
                },
                include: {
                    user: true,
                    plan: true
                }
            });

            const results = {
                renewed: 0,
                failed: 0,
                errors: []
            };

            console.log(`🔄 ${expiringSubscriptions.length} abonnements à renouveler`);

            for (const subscription of expiringSubscriptions) {
                try {
                    // Vérifier si le plan est toujours actif
                    if (!subscription.plan.isActive) {
                        console.log(`⚠️  Plan ${subscription.plan.name} non actif pour l'utilisateur ${subscription.user.email}`);

                        // Passer au plan gratuit
                        const freePlan = await prisma.subscriptionPlan.findFirst({
                            where: { slug: 'free' }
                        });

                        if (freePlan) {
                            await this.createSubscription(subscription.userId, freePlan.id);
                            await this.expireSubscription(subscription.id);
                        }

                        results.failed++;
                        continue;
                    }

                    // Créer un nouveau paiement pour le renouvellement
                    const payment = await prisma.payment.create({
                        data: {
                            userId: subscription.userId,
                            subscriptionId: subscription.id,
                            amount: subscription.plan.price,
                            currency: subscription.plan.currency,
                            status: 'PENDING',
                            paymentMethod: 'auto_renewal',
                            metadata: {
                                renewalFor: subscription.id,
                                originalEndDate: subscription.endDate
                            }
                        }
                    });

                    // Simuler le traitement du paiement
                    // Dans un vrai système, vous intégreriez avec Stripe, PayPal, etc.
                    const paymentResult = await this.processPayment(payment.id);

                    if (paymentResult.success) {
                        // Créer le nouvel abonnement
                        const newEndDate = new Date(subscription.endDate.getTime() + subscription.plan.duration * 24 * 60 * 60 * 1000);

                        const newSubscription = await prisma.subscription.create({
                            data: {
                                userId: subscription.userId,
                                planId: subscription.planId,
                                amount: subscription.plan.price,
                                currency: subscription.plan.currency,
                                startDate: subscription.endDate,
                                endDate: newEndDate,
                                status: 'ACTIVE',
                                autoRenew: subscription.autoRenew,
                                metadata: {
                                    renewedFrom: subscription.id,
                                    paymentId: payment.id
                                }
                            },
                            include: {
                                plan: true,
                                user: true
                            }
                        });

                        // Marquer l'ancien abonnement comme expiré
                        await prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: 'EXPIRED',
                                autoRenew: false
                            }
                        });

                        // Mettre à jour l'abonnement actuel de l'utilisateur
                        await prisma.user.update({
                            where: { id: subscription.userId },
                            data: { currentSubscriptionId: newSubscription.id }
                        });

                        // Marquer le paiement comme complété
                        await prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'COMPLETED',
                                metadata: {
                                    ...payment.metadata,
                                    newSubscriptionId: newSubscription.id,
                                    processedAt: new Date()
                                }
                            }
                        });

                        // Envoyer email de confirmation de renouvellement
                        await emailService.sendSubscriptionRenewed(
                            subscription.user.email,
                            subscription.plan.name,
                            newSubscription.endDate,
                            subscription.plan.price
                        );

                        console.log(`✅ Abonnement renouvelé pour ${subscription.user.email}`);
                        results.renewed++;

                    } else {
                        // Échec du paiement
                        await prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'FAILED',
                                metadata: {
                                    ...payment.metadata,
                                    failureReason: paymentResult.error,
                                    failedAt: new Date()
                                }
                            }
                        });

                        // Envoyer email d'échec de paiement
                        await emailService.sendPaymentFailed(
                            subscription.user.email,
                            subscription.plan.name,
                            subscription.endDate,
                            paymentResult.error
                        );

                        // Programmer une nouvelle tentative dans 3 jours
                        await this.scheduleRetryPayment(subscription.id, 3);

                        console.log(`❌ Échec du renouvellement pour ${subscription.user.email}: ${paymentResult.error}`);
                        results.failed++;
                        results.errors.push({
                            userId: subscription.userId,
                            email: subscription.user.email,
                            error: paymentResult.error
                        });
                    }

                } catch (error) {
                    console.error(`❌ Erreur lors du renouvellement pour ${subscription.user.email}:`, error);
                    results.failed++;
                    results.errors.push({
                        userId: subscription.userId,
                        email: subscription.user.email,
                        error: error.message
                    });

                    // Envoyer email d'erreur technique
                    await emailService.sendRenewalError(
                        subscription.user.email,
                        subscription.plan.name,
                        error.message
                    );
                }
            }

            console.log(`🎉 Renouvellement terminé: ${results.renewed} réussis, ${results.failed} échecs`);
            return results;

        } catch (error) {
            console.error('❌ Erreur lors du renouvellement automatique:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Traiter un paiement (simulation - à remplacer par votre gateway)
   */
    static async processPayment(paymentId) {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { user: true }
            });

            if (!payment) {
                throw new Error('Paiement non trouvé');
            }

            // Simulation du traitement de paiement
            // Dans un vrai système, vous appelleriez l'API de votre processeur de paiement

            // Simuler un taux de réussite de 90%
            const success = Math.random() > 0.1;

            if (success) {
                return {
                    success: true,
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    processedAt: new Date()
                };
            } else {
                const errors = [
                    'Carte expirée',
                    'Fonds insuffisants',
                    'Carte refusée',
                    'Erreur bancaire',
                    'Limite de crédit dépassée'
                ];

                return {
                    success: false,
                    error: errors[Math.floor(Math.random() * errors.length)]
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Programmer une nouvelle tentative de paiement
   */
    static async scheduleRetryPayment(subscriptionId, delayDays = 3) {
        try {
            const retryDate = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);

            // Créer une entrée pour la tentative de retry
            await prisma.paymentRetry?.create({
                data: {
                    subscriptionId,
                    scheduledFor: retryDate,
                    attemptCount: 1,
                    status: 'SCHEDULED'
                }
            });

            console.log(`📅 Nouvelle tentative programmée pour ${retryDate.toISOString()}`);

        } catch (error) {
            console.error('Erreur lors de la programmation du retry:', error);
        }
    }

    /**
     * Faire expirer un abonnement
     */
    static async expireSubscription(subscriptionId) {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
                include: { user: true, plan: true }
            });

            if (!subscription) {
                throw new Error('Abonnement non trouvé');
            }

            // Marquer comme expiré
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: 'EXPIRED',
                    autoRenew: false
                }
            });

            // Passer au plan gratuit
            const freePlan = await prisma.subscriptionPlan.findFirst({
                where: { slug: 'free' }
            });

            if (freePlan) {
                const freeSubscription = await this.createSubscription(subscription.userId, freePlan.id);

                if (freeSubscription.success) {
                    await this.activateSubscription(freeSubscription.subscription.id);
                }
            }

            // Envoyer email d'expiration
            await emailService.sendSubscriptionExpired(
                subscription.user.email,
                subscription.plan.name
            );

            return {
                success: true,
                message: 'Abonnement expiré avec succès'
            };

        } catch (error) {
            console.error('Erreur lors de l\'expiration:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async retryPayment(paymentId) {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { user: true }
            });

            if (!payment) {
                throw new Error('Paiement non trouvé');
            }

            // Simuler un taux de réussite de 90%
            const success = Math.random() > 0.1;
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const processedAt = new Date();
            const error = success ? null : 'Erreur de paiement';
            const status = success ? 'SUCCESS' : 'FAILED';
            const amount = payment.amount;
            const currency = payment.currency;
            const paymentMethod = payment.paymentMethod;
            const paymentStatus = success ? 'SUCCESS' : 'FAILED';
            const paymentType = 'RETRY';
            const paymentDetails = {
                cardNumber: '**** **** **** 1234',
                cardType: 'Visa',
                cardExpiry: '12/25',
                cardHolderName: 'John Doe'
            };

            // Mettre à jour le paiement
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    transactionId,
                    processedAt,
                    error,
                    status,
                    amount,
                    currency,
                    paymentMethod,
                    paymentStatus,
                    paymentType,
                    paymentDetails
                }
            });
            console.log(`💰 Paiement réussi pour ${payment.user.email}`);

            // Envoyer un email de confirmation
            await emailService.sendPaymentConfirmation(
                payment.user.email,
                payment.amount,
                payment.currency,
                payment.paymentMethod
            );

            return {
                success: true,
                message: 'Paiement réussi avec succès'
            };
        } catch (error) {
            console.error('Erreur lors du retry:', error);
            return null;
        }
    }

    static async getPaymentDetails(paymentId) {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { user: true }
            });

            if (!payment) {
                throw new Error('Paiement non trouvé');
            }

            return payment;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du paiement:', error);
            return null;
        }
    }

    /**
     * Traiter les abonnements expirés
     */
    static async processExpiredSubscriptions() {
        try {
            const now = new Date();

            const expiredSubscriptions = await prisma.subscription.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        lt: now
                    }
                },
                include: {
                    user: true,
                    plan: true
                }
            });

            console.log(`⏰ ${expiredSubscriptions.length} abonnements expirés à traiter`);

            const results = {
                processed: 0,
                errors: []
            };

            for (const subscription of expiredSubscriptions) {
                try {
                    await this.expireSubscription(subscription.id);
                    results.processed++;
                    console.log(`✅ Abonnement expiré traité pour ${subscription.user.email}`);
                } catch (error) {
                    console.error(`❌ Erreur pour ${subscription.user.email}:`, error);
                    results.errors.push({
                        userId: subscription.userId,
                        email: subscription.user.email,
                        error: error.message
                    });
                }
            }

            return results;

        } catch (error) {
            console.error('Erreur lors du traitement des abonnements expirés:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtenir les statistiques des abonnements
     */
    static async getSubscriptionStats() {
        try {
            const stats = await prisma.subscription.groupBy({
                by: ['status'],
                _count: {
                    id: true
                }
            });

            const planStats = await prisma.subscription.groupBy({
                by: ['planId'],
                where: {
                    status: 'ACTIVE'
                },
                _count: {
                    id: true
                },
                _sum: {
                    amount: true
                }
            });

            const totalRevenue = await prisma.payment.aggregate({
                where: {
                    status: 'COMPLETED'
                },
                _sum: {
                    amount: true
                }
            });

            return {
                subscriptionsByStatus: stats,
                activeSubscriptionsByPlan: planStats,
                totalRevenue: totalRevenue._sum.amount || 0,
                lastUpdated: new Date()
            };

        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            return null;
        }
    };

    /**
     * Obtenir les plans d'abonnements
     */

    static async getSubscriptionPlans() {
        try {
            const plans = await prisma.subscriptionPlan.findMany();
            return plans;
        } catch (error) {
            console.error('Erreur lors de la récupération des plans d\'abonnement:', error);
            return [];
        }
    }

    /**
     * Obtenir les détails d'un abonnement
     */
    static async getSubscriptionPlanById(id) {
        try {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id }
            });
            return plan;
        } catch (error) {
            console.error('Erreur lors de la récupération du plan d\'abonnement:', error);
            return null;
        }
    }

    /**
     Obtenir l'abonnement actuel d'un utilisateur
    */
    static async getCurrentSubscription(userId) {
        try {
            const currentSubscription = await prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'ACTIVE'
                },
                include: {
                    plan: true
                }
            });
            return currentSubscription;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'abonnement actuel:', error);
            return null;
        }
    }

    static async getSubscriptionHistory(userId) {
        try {
            const subscriptionHistory = await prisma.subscription.findMany({
                where: {
                    userId
                },
                include: {
                    plan: true
                }
            });
            return subscriptionHistory;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique des abonnements:', error);
            return null;
        }
    }

    static async getPaymentHistory(userId) {
        try {
            const paymentHistory = await prisma.payment.findMany({
                where: {
                    userId
                }
            });
            return paymentHistory;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
            return null;
        }
    }

    static async changeSubscriptionPlan(userId, newPlanId) {
        try {
            const currentSubscription = await this.getCurrentSubscription(userId);
            if (!currentSubscription) {
                throw new Error('Aucun abonnement actif trouvé pour cet utilisateur.');
            }
            const newPlan = await this.getSubscriptionPlanById(newPlanId);
            if (!newPlan) {
                throw new Error('Plan d\'abonnement invalide.');
            }
            const updatedSubscription = await prisma.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    planId: newPlanId,
                    endDate: new Date(Date.now() + newPlan.duration * 24 * 60 * 60 * 1000)
                }
            });
            return updatedSubscription;
        } catch (error) {
            consolele.error('Erreur lors du changement de plan d\'abonnement:', error);
            return null;
        }
    }

    static async reactivateSubscription(userId) {
        try {
            const currentSubscription = await this.getCurrentSubscription(userId);
            if (!currentSubscription) {
                throw new Error('Aucun abonnement actif trouvé pour cet utilisateur.');
            }

            const updatedSubscription = await prisma.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    status: 'ACTIVE',
                    endDate: new Date(Date.now() + currentSubscription.plan.duration * 24 * 60 * 60 * 1000)
                }
            });

            return updatedSubscription;
        } catch (error) {
            console.error('Erreur lors de la réactivation de l\'abonnement:', error);
            return null;
        }
    }

    static async toggleAutoRenew(userId, enable) {
        try {
            const currentSubscription = await this.getCurrentSubscription(userId);

            if (!currentSubscription) {
                throw new Error('Aucun abonnement actif trouvé pour cet utilisateur.');
            }

            const updatedSubscription = await prisma.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    autoRenew: enable
                }
            });

            return updatedSubscription;
        } catch (error) {
            console.error('Erreur lors de la modification de l\'auto-renouvellement:', error);
            return null;
        }
    }
}

module.exports = SubscriptionService;