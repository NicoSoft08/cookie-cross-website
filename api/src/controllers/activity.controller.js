const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.getUserActivityLogs = async (req, res) => {
    const userId = req.user.id;

    try {
        const [securityLogs, loginLogs] = await Promise.all([
            prisma.securityLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),

            prisma.loginLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            })
        ]);

        console.log('[GET USER ACTIVITY LOGS]', { securityLogs, loginLogs });

        res.json({
            success: true,
            message: 'Logs récupérés avec succès',
            securityLogs,
            loginLogs,
        });
    } catch (error) {
        console.error('[GET USER ACTIVITY LOGS ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
}