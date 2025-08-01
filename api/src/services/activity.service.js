const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class ActivityService {
    static async logActivity(userId, action, metadata = {}) {
        try {
            await prisma.activityLog.create({
                data: {
                    userId,
                    action,
                    metadata
                }
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'activité', error);
            return false;
        }
    }
};

module.exports = ActivityService;