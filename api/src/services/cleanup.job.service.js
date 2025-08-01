const cron = require('node-cron');
const VerificationCodeService = require('./verificationCode.service');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class CleanupJob {

    static async cleanupPresence() {
        // Toutes les 2 minutes
        cron.schedule('*/2 * * * *', async () => {
            const thresholdDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes

            try {
                const result = await prisma.user.updateMany({
                    where: {
                        isOnline: true,
                        lastOnline: {
                            lt: thresholdDate, // lastOnline < il y a 2 min
                        },
                    },
                    data: {
                        isOnline: false,
                    },
                });

                console.log(`[PRESENCE CRON] ${result.count} utilisateurs passés hors ligne.`);
            } catch (error) {
                console.error('[PRESENCE CRON ERROR]', error);
            }
        });
    }

    /**
     * Nettoyer les codes de vérification expirés
     */
    static async cleanupExpiredCodes() {
        try {
            console.log('🧹 Début du nettoyage des codes expirés...');

            const deletedCount = await VerificationCodeService.cleanupExpiredCodes();

            console.log(`✅ ${deletedCount} codes expirés supprimés`);
            return deletedCount;
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des codes:', error);
            return 0;
        }
    }

    /**
     * Nettoyer les utilisateurs non vérifiés après 24h
     */
    static async cleanupUnverifiedUsers() {
        try {
            console.log('🧹 Début du nettoyage des utilisateurs non vérifiés...');

            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const unverifiedUsers = await prisma.user.findMany({
                where: {
                    emailVerified: false,
                    createdAt: {
                        lt: oneDayAgo
                    }
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true
                }
            });

            if (unverifiedUsers.length > 0) {
                // Supprimer les codes de vérification associés
                await prisma.verificationCode.deleteMany({
                    where: {
                        userId: {
                            in: unverifiedUsers.map(user => user.id)
                        }
                    }
                });

                // Supprimer les utilisateurs non vérifiés
                const result = await prisma.user.deleteMany({
                    where: {
                        id: {
                            in: unverifiedUsers.map(user => user.id)
                        }
                    }
                });

                console.log(`✅ ${result.count} utilisateurs non vérifiés supprimés`);
                return result.count;
            } else {
                console.log('ℹ️  Aucun utilisateur non vérifié à supprimer');
                return 0;
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des utilisateurs:', error);
            return 0;
        }
    }

    /**
     * Nettoyer les sessions expirées (si vous utilisez des sessions en DB)
     */
    static async cleanupExpiredSessions() {
        try {
            console.log('🧹 Début du nettoyage des sessions expirées...');

            // Si vous avez une table Session
            const result = await prisma.session?.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });

            if (result) {
                console.log(`✅ ${result.count} sessions expirées supprimées`);
                return result.count;
            }

            return 0;
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des sessions:', error);
            return 0;
        }
    }

    /**
     * Nettoyer les annonces expirées
     */
    static async cleanupExpiredListings() {
        try {
            console.log('🧹 Début du nettoyage des annonces expirées...');

            const now = new Date();

            // Marquer les annonces comme expirées
            const result = await prisma.listing.updateMany({
                where: {
                    expiresAt: {
                        lt: now
                    },
                    status: {
                        in: ['ACTIVE', 'PENDING']
                    }
                },
                data: {
                    status: 'EXPIRED'
                }
            });

            console.log(`✅ ${result.count} annonces marquées comme expirées`);
            return result.count;
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des annonces:', error);
            return 0;
        }
    }

    /**
     * Nettoyer les fichiers temporaires
     */
    static async cleanupTempFiles() {
        try {
            console.log('🧹 Début du nettoyage des fichiers temporaires...');

            const fs = require('fs').promises;
            const path = require('path');

            const tempDir = path.join(process.cwd(), 'temp');
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

            try {
                const files = await fs.readdir(tempDir);
                let deletedCount = 0;

                for (const file of files) {
                    const filePath = path.join(tempDir, file);
                    const stats = await fs.stat(filePath);

                    if (stats.mtime.getTime() < oneDayAgo) {
                        await fs.unlink(filePath);
                        deletedCount++;
                    }
                }

                console.log(`✅ ${deletedCount} fichiers temporaires supprimés`);
                return deletedCount;
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
                return 0;
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des fichiers:', error);
            return 0;
        }
    }

    /**
     * Exécuter toutes les tâches de nettoyage
     */
    static async runAllCleanupTasks() {
        console.log('🚀 Début des tâches de nettoyage automatique...');

        const startTime = Date.now();
        const results = {};

        try {
            // Nettoyer les codes expirés
            results.expiredCodes = await this.cleanupExpiredCodes();

            // Nettoyer les utilisateurs non vérifiés
            results.unverifiedUsers = await this.cleanupUnverifiedUsers();

            // Nettoyer les sessions expirées
            results.expiredSessions = await this.cleanupExpiredSessions();

            // Nettoyer les annonces expirées
            results.expiredListings = await this.cleanupExpiredListings();

            // Nettoyer les fichiers temporaires
            results.tempFiles = await this.cleanupTempFiles();

            const duration = Date.now() - startTime;

            console.log('🎉 Tâches de nettoyage terminées!');
            console.log(`⏱️  Durée: ${duration}ms`);
            console.log('📊 Résultats:', results);

            return {
                success: true,
                duration,
                results
            };

        } catch (error) {
            console.error('❌ Erreur lors des tâches de nettoyage:', error);
            return {
                success: false,
                error: error.message,
                results
            };
        }
    }

    /**
     * Démarrer les tâches programmées
     */
    static startScheduledTasks() {
        console.log('📅 Démarrage des tâches programmées...');

        // Nettoyer les codes expirés toutes les heures
        cron.schedule('0 * * * *', async () => {
            console.log('⏰ Exécution programmée: nettoyage des codes expirés');
            await this.cleanupExpiredCodes();
        });

        // Nettoyer les utilisateurs non vérifiés tous les jours à 2h du matin
        cron.schedule('0 2 * * *', async () => {
            console.log('⏰ Exécution programmée: nettoyage des utilisateurs non vérifiés');
            await this.cleanupUnverifiedUsers();
        });

        // Nettoyer les annonces expirées tous les jours à 3h du matin
        cron.schedule('0 3 * * *', async () => {
            console.log('⏰ Exécution programmée: nettoyage des annonces expirées');
            await this.cleanupExpiredListings();
        });

        // Nettoyer les fichiers temporaires tous les jours à 4h du matin
        cron.schedule('0 4 * * *', async () => {
            console.log('⏰ Exécution programmée: nettoyage des fichiers temporaires');
            await this.cleanupTempFiles();
        });

        // Nettoyage complet tous les dimanches à 1h du matin
        cron.schedule('0 1 * * 0', async () => {
            console.log('⏰ Exécution programmée: nettoyage complet hebdomadaire');
            await this.runAllCleanupTasks();
        });

        console.log('✅ Tâches programmées démarrées avec succès');
    }

    /**
     * Arrêter toutes les tâches programmées
     */
    static stopScheduledTasks() {
        cron.getTasks().forEach(task => {
            task.stop();
        });
        console.log('🛑 Toutes les tâches programmées ont été arrêtées');
    }
}

module.exports = CleanupJob;
