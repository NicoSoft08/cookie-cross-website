const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class MonitoringService {

    /**
     * Enregistrer l'exécution d'une tâche
     */
    static async logTaskExecution(taskName, status, details = {}) {
        try {
            // Si vous voulez garder un historique des tâches
            await prisma.taskLog?.create({
                data: {
                    taskName,
                    status, // 'SUCCESS', 'ERROR', 'WARNING'
                    details: JSON.stringify(details),
                    executedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la tâche:', error);
        }
    }

    /**
     * Obtenir les statistiques des tâches
     */
    static async getTaskStats() {
        try {
            const stats = {
                totalCodes: await prisma.verificationCode.count(),
                expiredCodes: await prisma.verificationCode.count({
                    where: {
                        expiresAt: { lt: new Date() }
                    }
                }),
                unverifiedUsers: await prisma.user.count({
                    where: {
                        emailVerified: false,
                        createdAt: {
                            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                expiredListings: await prisma.listing.count({
                    where: {
                        expiresAt: { lt: new Date() },
                        status: { in: ['ACTIVE', 'PENDING'] }
                    }
                })
            };

            return stats;
        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            return null;
        }
    }
}

module.exports = MonitoringService;
