const { PrismaClient } = require("../generated/prisma");
const crypto = require('crypto');
const prisma = new PrismaClient();

class ConnectionTrackingService {
    /**
    * Collecter toutes les informations de connexion
    */
    static async collectConnectionInfo(req, userId = null) {
        const ip = this.getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const deviceInfo = this.parseDeviceInfo(userAgent);
        const locationInfo = this.getLocationInfo(ip);
        const fingerprint = this.generateDeviceFingerprint(req);

        return {
            userId,
            ip,
            userAgent,
            deviceInfo,
            locationInfo,
            fingerprint,
            timestamp: new Date(),
            headers: this.sanitizeHeaders(req.headers)
        };
    }

    /**
     * Obtenir l'IP réelle du client
    */
    static getClientIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.ip ||
            'unknown';
    }

    /**
     * Parser les informations de l'appareil
    */
    static parseDeviceInfo(userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        return {
            browser: {
                name: result.browser.name || 'Unknown',
                version: result.browser.version || 'Unknown'
            },
            os: {
                name: result.os.name || 'Unknown',
                version: result.os.version || 'Unknown'
            },
            device: {
                type: result.device.type || 'desktop',
                vendor: result.device.vendor || 'Unknown',
                model: result.device.model || 'Unknown'
            },
            engine: {
                name: result.engine.name || 'Unknown',
                version: result.engine.version || 'Unknown'
            }
        };
    }

    /**
    * Obtenir les informations de géolocalisation
    */
    static getLocationInfo(ip) {
        if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
            return {
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown',
                timezone: 'Unknown',
                coordinates: null
            };
        }

        const geo = geoip.lookup(ip);

        if (!geo) {
            return {
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown',
                timezone: 'Unknown',
                coordinates: null
            };
        }

        return {
            country: geo.country || 'Unknown',
            region: geo.region || 'Unknown',
            city: geo.city || 'Unknown',
            timezone: geo.timezone || 'Unknown',
            coordinates: geo.ll ? {
                latitude: geo.ll[0],
                longitude: geo.ll[1]
            } : null
        };
    }

    /**
     * Générer une empreinte unique de l'appareil
    */
    static generateDeviceFingerprint(req) {
        const components = [
            req.headers['user-agent'] || '',
            req.headers['accept-language'] || '',
            req.headers['accept-encoding'] || '',
            req.headers['accept'] || '',
            this.getClientIP(req)
        ];

        return crypto
            .createHash('sha256')
            .update(components.join('|'))
            .digest('hex');
    }

    /**
     * Nettoyer les headers sensibles
     */
    static sanitizeHeaders(headers) {
        const sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token'
        ];

        const sanitized = { ...headers };
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    /**
     * Enregistrer une tentative de connexion
    */
    static async logConnectionAttempt(connectionInfo, credentials, success = false, failureReason = null) {
        try {
            const loginLog = await prisma.loginLog.create({
                data: {
                    userId: connectionInfo.userId,
                    email: credentials.email,
                    ip: connectionInfo.ip,
                    userAgent: connectionInfo.userAgent,
                    deviceInfo: JSON.stringify(connectionInfo.deviceInfo),
                    locationInfo: JSON.stringify(connectionInfo.locationInfo),
                    deviceFingerprint: connectionInfo.fingerprint,
                    success,
                    failureReason,
                    headers: JSON.stringify(connectionInfo.headers),
                    createdAt: connectionInfo.timestamp
                }
            });

            // Analyser les risques si connexion réussie
            if (success && connectionInfo.userId) {
                await this.analyzeConnectionRisk(connectionInfo.userId, connectionInfo);
            }

            return loginLog;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la connexion:', error);
            throw error;
        }
    }

    /**
     * Analyser les risques de la connexion
     */
    static async analyzeConnectionRisk(userId, connectionInfo) {
        const riskFactors = [];
        let riskScore = 0;

        // Vérifier si c'est un nouvel appareil
        const existingDevice = await prisma.loginLog.findFirst({
            where: {
                userId,
                deviceFingerprint: connectionInfo.fingerprint,
                success: true
            }
        });

        if (!existingDevice) {
            riskFactors.push('Nouvel appareil');
            riskScore += 30;
        }

        // Vérifier la géolocalisation
        const recentLogins = await prisma.loginLog.findMany({
            where: {
                userId,
                success: true,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (recentLogins.length > 0) {
            const lastLocation = JSON.parse(recentLogins[0].locationInfo);
            if (lastLocation.country !== connectionInfo.locationInfo.country) {
                riskFactors.push('Connexion depuis un nouveau pays');
                riskScore += 40;
            } else if (lastLocation.city !== connectionInfo.locationInfo.city) {
                riskFactors.push('Connexion depuis une nouvelle ville');
                riskScore += 20;
            }
        }

        // Vérifier les tentatives échouées récentes
        const failedAttempts = await prisma.loginLog.count({
            where: {
                userId,
                success: false,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
                }
            }
        });

        if (failedAttempts > 2) {
            riskFactors.push('Tentatives échouées récentes');
            riskScore += 25;
        }

        // Vérifier l'heure de connexion inhabituelle
        const hour = new Date().getHours();
        const userUsualHours = await this.getUserUsualConnectionHours(userId);

        if (!userUsualHours.includes(hour)) {
            riskFactors.push('Heure de connexion inhabituelle');
            riskScore += 15;
        }

        // Enregistrer l'analyse de risque
        if (riskScore > 0) {
            await prisma.riskAssessment.create({
                data: {
                    userId,
                    riskScore,
                    riskFactors: JSON.stringify(riskFactors),
                    connectionInfo: JSON.stringify(connectionInfo),
                    requiresVerification: riskScore > 50,
                    createdAt: new Date()
                }
            });
        }

        return { riskScore, riskFactors };
    }

    /**
     * Obtenir les heures habituelles de connexion de l'utilisateur
     */
    static async getUserUsualConnectionHours(userId) {
        const connections = await prisma.loginLog.findMany({
            where: {
                userId,
                success: true,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
                }
            },
            select: { createdAt: true }
        });

        const hourCounts = {};
        connections.forEach(conn => {
            const hour = conn.createdAt.getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Retourner les heures avec au moins 2 connexions
        return Object.keys(hourCounts)
            .filter(hour => hourCounts[hour] >= 2)
            .map(hour => parseInt(hour));
    }

    /**
     * Détecter les connexions suspectes
     */
    static async detectSuspiciousActivity(userId) {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Connexions multiples depuis différents pays
        const recentConnections = await prisma.loginLog.findMany({
            where: {
                userId,
                success: true,
                createdAt: { gte: last24h }
            },
            select: { locationInfo: true, createdAt: true }
        });

        const countries = new Set();
        recentConnections.forEach(conn => {
            const location = JSON.parse(conn.locationInfo);
            countries.add(location.country);
        });

        if (countries.size > 2) {
            return {
                suspicious: true,
                reason: 'Connexions depuis plusieurs pays en 24h',
                details: Array.from(countries)
            };
        }

        // Trop de tentatives échouées
        const failedAttempts = await prisma.loginLog.count({
            where: {
                userId,
                success: false,
                createdAt: { gte: last24h }
            }
        });

        if (failedAttempts > 5) {
            return {
                suspicious: true,
                reason: 'Trop de tentatives de connexion échouées',
                details: { attempts: failedAttempts }
            };
        }

        return { suspicious: false };
    }
};

module.exports = ConnectionTrackingService;