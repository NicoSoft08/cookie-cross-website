const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class AccountVerificationCodeService {
    static async generateVerificationCode(userId) {
        const correctCode = Math.floor(Math.random() * 90 + 10); // de 10 à 99
        const choices = [correctCode];

        while (choices.length < 3) {
            const rand = Math.floor(Math.random() * 90 + 10);
            if (!choices.includes(rand)) choices.push(rand);
        }

        const shuffled = choices.sort(() => Math.random() - 0.5);

        await prisma.accountVerificationCode.create({
            data: {
                userId: userId,
                code: correctCode,
                choices: JSON.stringify(shuffled),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes à partir de maintenant
            }
        });

        return {
            correctCode,
            choices: shuffled
        };
    }

    static async verifyCode(userId, code) {
        const codeRecord = await prisma.accountVerificationCode.findFirst({
            where: {
                userId: userId,
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!codeRecord) {
            return { success: false, message: 'Code invalide ou expiré.' };
        }

        if (codeRecord.code !== code) {
            return { success: false, message: 'Code incorrect.' };
        }

        await prisma.accountVerificationCode.update({
            where: { id: codeRecord.id },
            data: { isUsed: true }
        });

        return { success: true, message: 'Code vérifié avec succès.' };
    }
};

module.exports = AccountVerificationCodeService;