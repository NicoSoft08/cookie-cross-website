const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('./email.service');

const app_url = process.env.APP_URL || 'http://localhost:3000';

const prisma = new PrismaClient();

class PasswordResetService {

    /**
     * Générer un token de réinitialisation sécurisé
     */
    static generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Demander une réinitialisation de mot de passe
     */
    static async requestPasswordReset(email, ipAddress = null, userAgent = null) {
        try {
            // Vérifier si l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            // Pour des raisons de sécurité, on renvoie toujours un succès
            // même si l'email n'existe pas (évite l'énumération d'emails)
            if (!user) {
                return {
                    success: true,
                    message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
                };
            }

            // Vérifier si l'utilisateur est actif
            if (!user.isActive) {
                return {
                    success: false,
                    message: 'Ce compte est désactivé'
                };
            }

            // Invalider tous les anciens tokens non utilisés
            await prisma.passwordResetToken.updateMany({
                where: {
                    userId: user.id,
                    used: false,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                data: {
                    used: true,
                    usedAt: new Date()
                }
            });

            // Générer un nouveau token
            const token = this.generateResetToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

            // Sauvegarder le token
            const resetToken = await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt,
                    ipAddress,
                    userAgent
                }
            });

            // Envoyer l'email de réinitialisation
            const resetLink = `${app_url}/auth/reset-password?token=${token}`;

            await emailService.sendPasswordResetEmail(
                user.email,
                user.firstName || 'Utilisateur',
                resetLink,
                expiresAt
            );

            // Log de sécurité
            console.log(`🔐 Demande de réinitialisation pour ${email} depuis ${ipAddress}`);

            return {
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
                tokenId: resetToken.id // Pour les tests uniquement
            };

        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            return {
                success: false,
                message: 'Une erreur est survenue. Veuillez réessayer.'
            };
        }
    }

    /**
     * Valider un token de réinitialisation
     */
    static async validateResetToken(token) {
        try {
            if (!token || typeof token !== 'string') {
                return {
                    valid: false,
                    message: 'Token invalide'
                };
            }

            const resetToken = await prisma.passwordResetToken.findUnique({
                where: { token },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            isActive: true
                        }
                    }
                }
            });

            if (!resetToken) {
                return {
                    valid: false,
                    message: 'Token invalide ou expiré'
                };
            }

            // Vérifier si le token a déjà été utilisé
            if (resetToken.used) {
                return {
                    valid: false,
                    message: 'Ce lien a déjà été utilisé'
                };
            }

            // Vérifier si le token a expiré
            if (new Date() > resetToken.expiresAt) {
                // Marquer comme utilisé pour éviter les réutilisations
                await prisma.passwordResetToken.update({
                    where: { id: resetToken.id },
                    data: { used: true, usedAt: new Date() }
                });

                return {
                    valid: false,
                    message: 'Ce lien a expiré'
                };
            }

            // Vérifier si l'utilisateur est toujours actif
            if (!resetToken.user.isActive) {
                return {
                    valid: false,
                    message: 'Ce compte est désactivé'
                };
            }

            return {
                valid: true,
                user: resetToken.user,
                tokenId: resetToken.id
            };

        } catch (error) {
            console.error('Erreur lors de la validation du token:', error);
            return {
                valid: false,
                message: 'Erreur lors de la validation'
            };
        }
    }

    /**
     * Réinitialiser le mot de passe
     */
    static async resetPassword(token, newPassword, confirmPassword, ipAddress = null) {
        try {
            // Valider les mots de passe
            if (!newPassword || !confirmPassword) {
                return {
                    success: false,
                    message: 'Mot de passe et confirmation requis'
                };
            }

            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    message: 'Les mots de passe ne correspondent pas'
                };
            }

            // Valider la force du mot de passe
            const passwordValidation = this.validatePasswordStrength(newPassword);
            if (!passwordValidation.valid) {
                return {
                    success: false,
                    message: passwordValidation.message
                };
            }

            // Valider le token
            const tokenValidation = await this.validateResetToken(token);
            if (!tokenValidation.valid) {
                return {
                    success: false,
                    message: tokenValidation.message
                };
            }

            const user = tokenValidation.user;

            // Vérifier que le nouveau mot de passe est différent de l'ancien
            const isSamePassword = await bcrypt.compare(newPassword, await this.getCurrentPassword(user.id));
            if (isSamePassword) {
                return {
                    success: false,
                    message: 'Le nouveau mot de passe doit être différent de l\'ancien'
                };
            }

            // Hasher le nouveau mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Mettre à jour le mot de passe
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            });

            // Marquer le token comme utilisé
            await prisma.passwordResetToken.update({
                where: { token },
                data: {
                    used: true,
                    usedAt: new Date()
                }
            });

            // Invalider tous les autres tokens de cet utilisateur
            await prisma.passwordResetToken.updateMany({
                where: {
                    userId: user.id,
                    used: false,
                    id: { not: tokenValidation.tokenId }
                },
                data: {
                    used: true,
                    usedAt: new Date()
                }
            });

            // Envoyer email de confirmation
            await emailService.sendPasswordResetConfirmation(
                user.email,
                user.firstName || 'Utilisateur',
                ipAddress
            );

            // Log de sécurité
            console.log(`✅ Mot de passe réinitialisé pour ${user.email} depuis ${ipAddress}`);

            return {
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            };

        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            return {
                success: false,
                message: 'Une erreur est survenue lors de la réinitialisation'
            };
        }
    }

    /**
     * Valider la force du mot de passe
     */
    static validatePasswordStrength(password) {
        if (!password || password.length < 8) {
            return {
                valid: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            };
        }

        if (password.length > 128) {
            return {
                valid: false,
                message: 'Le mot de passe ne peut pas dépasser 128 caractères'
            };
        }

        // Vérifier la complexité
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        if (complexityScore < 3) {
            return {
                valid: false,
                message: 'Le mot de passe doit contenir au moins 3 des éléments suivants : majuscule, minuscule, chiffre, caractère spécial'
            };
        }

        // Vérifier les mots de passe communs
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];

        if (commonPasswords.includes(password.toLowerCase())) {
            return {
                valid: false,
                message: 'Ce mot de passe est trop commun'
            };
        }

        return { valid: true };
    }

    /**
     * Obtenir le mot de passe actuel (pour comparaison)
     */
    static async getCurrentPassword(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { password: true }
            });
            return user?.password || '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Nettoyer les tokens expirés (tâche de maintenance)
     */
    static async cleanupExpiredTokens() {
        try {
            const result = await prisma.passwordResetToken.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { used: true, usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 jours
                    ]
                }
            });

            console.log(`🧹 ${result.count} tokens de réinitialisation nettoyés`);
            return result.count;

        } catch (error) {
            console.error('Erreur lors du nettoyage des tokens:', error);
            return 0;
        }
    }

    /**
     * Obtenir les statistiques de sécurité
     */
    static async getSecurityStats(userId) {
        try {
            const stats = await prisma.passwordResetToken.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    createdAt: true,
                    used: true,
                    usedAt: true,
                    ipAddress: true,
                    expiresAt: true
                }
            });

            return {
                recentResets: stats,
                totalRequests: stats.length,
                successfulResets: stats.filter(s => s.used).length
            };

        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            return null;
        }
    }
}

module.exports = PasswordResetService;
