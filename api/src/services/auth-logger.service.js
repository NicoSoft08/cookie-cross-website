const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();


class AuthLoggerService {
    static async fetchLocation(ip) {
        try {
            const response = await fetch(`https://ipwho.is/${ip}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Vérifie si la requête est un succès
            if (!result.success) {
                console.warn("IP lookup failed:", result.message || result);
                return null;
            }

            console.log("Data from ipwho.is:", result);

            return {
                city: result.city,
                region: result.region,
                country: result.country,
                continent: result.continent,
            };
        } catch (error) {
            console.error("Erreur lors de la récupération de la localisation :", error);
            return null;
        }
    }

    static async logAttempt(userId, ip, browser, os, device, isTabel, isMobile, isBot, status, reason = null) {
        try {
            // Récupération localisation
            const location = await this.fetchLocation(ip);
            console.log("Location data:", location);

            const logEntry = await prisma.loginLog.create({
                data: {
                    
                    userId, // Assurez-vous que c'est un Int, pas une string
                    ip,
                    city: location?.city,
                    country: location?.country,
                    status, // Doit correspondre à l'enum LoginStatus
                    reason,
                    browser,
                    os,
                    device,
                    isTabel,
                    isMobile,
                    isBot,
                }
            });

            return logEntry;
        } catch (error) {
            console.error('Failed to log login attempt:', error);
            throw error; // Important pour le débogage
        }
    }

    static async analyzeSuspiciousActivity(userId, ip, device) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Récupérer les échecs récents
        const recentFailures = await prisma.loginLog.findMany({
            where: {
                userId,
                status: 'FAILURE',
                createdAt: { gte: oneDayAgo }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Brute force detection
        if (recentFailures.length >= 5) {
            const uniqueIps = [...new Set(recentFailures.map(a => a.ip))];
            return {
                isSuspicious: true,
                type: 'brute_force',
                severity: 'high',
                reason: `5+ échecs récents de connexion`,
                failedAttempts: recentFailures.length,
                ips: uniqueIps,
                lastAttempt: recentFailures[0]
            };
        }

        // Géolocalisation anormale
        const lastSuccess = await prisma.loginLog.findFirst({
            where: {
                userId,
                status: 'SUCCESS'
            },
            orderBy: { createdAt: 'desc' }
        });

        const location = await this.fetchLocation(ip);
        console.log("Localisation détectée :", location?.country, location?.city);

        const hasGeoInfo =
            lastSuccess?.country && lastSuccess?.city &&
            location?.country && location?.city;

        if (hasGeoInfo && lastSuccess.country !== location.country) {
            return {
                isSuspicious: true,
                type: 'geo_mismatch',
                severity: 'medium', // 'low', 'medium', 'high', 'critical'
                reason: `Changement de pays détecté`,
                previousCountry: lastSuccess.country,
                currentCountry: location.country,
                previousCity: lastSuccess.city,
                currentCity: location.city,
            };
        }

        // Détection nouveau appareil
        const knownDevice = await prisma.loginLog.findFirst({
            where: {
                userId,
                device: { 
                   not: device,
                }
            }
        });

        if (knownDevice && knownDevice.device !== device) {
            return {
                isSuspicious: true,
                type: 'new_device',
                severity: 'low',
                reason: `Nouvel appareil détecté`,
                previousDevice: knownDevice.device,
                currentDevice: device,
            };
        }

        return { isSuspicious: false };
    };
}

module.exports = AuthLoggerService;