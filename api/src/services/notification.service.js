const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class NotificationService {
    static async createNotification(targetType, targetId, type, message, metadata = {}) {

        if (!targetType || !targetId || !type || !message) {
            throw new Error('Tous les champs sont requis pour créer une notification');
        }

        const data = {
            targetType,
            type,
            message,
            metadata,
        };

        if (targetType === 'USER') {
            data.userId = targetId;
        } else if (targetType === 'STORE') {
            data.storeId = targetId;
        } else {
            throw new Error('Type de cible invalide');
        }

        return await prisma.notification.create({ data });
    }
};

module.exports = NotificationService;