const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class VerificationCodeService {
    /**
  * Générer un code de vérification
  */
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
   * Créer un nouveau code de vérification
   */
    static async createCode(email, type = 'EMAIL_VERIFICATION', userId = null) {
        try {
            // Supprimer les anciens codes non utilisés pour cet email et ce type
            await prisma.verificationCode.deleteMany({
                where: {
                    email,
                    type,
                    isUsed: false
                }
            });

            // Générer un nouveau code
            const code = this.generateCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            const verificationCode = await prisma.verificationCode.create({
                data: {
                    code,
                    type,
                    email,
                    userId,
                    expiresAt
                }
            });

            return {
                success: true,
                code: verificationCode.code,
                expiresAt: verificationCode.expiresAt
            };

        } catch (error) {
            console.error('Erreur lors de la création du code:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Vérifier un code
   */
    static async verifyCode(email, code, type = 'EMAIL_VERIFICATION') {
        try {
            const verificationCode = await prisma.verificationCode.findFirst({
                where: {
                    email,
                    code,
                    type,
                    isUsed: false,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (!verificationCode) {
                // Incrémenter les tentatives si le code existe mais est incorrect
                await prisma.verificationCode.updateMany({
                    where: {
                        email,
                        type,
                        isUsed: false,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    data: {
                        attempts: {
                            increment: 1
                        }
                    }
                });

                return {
                    success: false,
                    message: 'Code incorrect ou expiré'
                };
            }

            // Vérifier le nombre de tentatives
            if (verificationCode.attempts >= verificationCode.maxAttempts) {
                return {
                    success: false,
                    message: 'Nombre maximum de tentatives atteint'
                };
            }

            // Marquer le code comme utilisé
            await prisma.verificationCode.update({
                where: {
                    id: verificationCode.id
                },
                data: {
                    isUsed: true
                }
            });

            return {
                success: true,
                message: 'Code vérifié avec succès',
                codeData: verificationCode
            };

        } catch (error) {
            console.error('Erreur lors de la vérification du code:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
  * Nettoyer les codes expirés
  */
    static async cleanupExpiredCodes() {
        try {
            const result = await prisma.verificationCode.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });

            console.log(`${result.count} codes expirés supprimés`);
            return result.count;

        } catch (error) {
            console.error('Erreur lors du nettoyage des codes:', error);
            return 0;
        }
    }

    /**
   * Vérifier si un code existe et est valide
   */
    static async isCodeValid(email, type = 'EMAIL_VERIFICATION') {
        try {
            const code = await prisma.verificationCode.findFirst({
                where: {
                    email,
                    type,
                    isUsed: false,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            return !!code;
        } catch (error) {
            return false;
        }
    }
};

module.exports = VerificationCodeService;