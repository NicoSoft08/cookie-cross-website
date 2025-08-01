const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.getDeviceByUserId = async (req, res) => {
    const { id } = req.params;

    try {
        const devices = await prisma.deviceSession.findMany({
            where: { userId: id },
            orderBy: { lastUsed: 'desc' },
        });

        if (!devices || devices.length === 0) {
            console.log('Aucun appareil trouvé pour cet utilisateur');
            return res.status(404).json({
                success: false,
                message: 'Aucun appareil trouvé pour cet utilisateur'
            });
        }

        res.json({
            success: true,
            message: 'Informations sur les appareils récupérées avec succès',
            data: devices
        });
    } catch (error) {
        console.error('[GET DEVICE BY USER ID ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des informations sur les appareils',
            error: error.message
        });
    }
}