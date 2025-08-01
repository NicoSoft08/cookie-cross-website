const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('../generated/prisma');
dotenv.config();

const prisma = new PrismaClient();

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur introuvable.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Compte désactivé. Contactez un administrateur.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur authenticate:', error);
        res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};

exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "Accès refusé : rôle insuffisant"
            });
        }

        next();
    }
};

exports.verifyCaptcha = async (token) => {
    try {
        const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
        });

        const data = await response.json();

        console.log('Captcha verification response:', data);

        return {
            success: data.success,
            score: data.score, // Only available in v3
            action: data.action, // Only available in v3
            timestamp: data.challenge_ts,
            hostname: data.hostname
        };
    } catch (error) {
        console.error('Error verifying captcha:', error);
        return { success: false };
    }
}

// Gestion des différents types d'erreurs JWT
exports.getJwtErrorMessage = (err) => {
    if (err.name === 'TokenExpiredError') {
        return 'Token expiré. Veuillez vous reconnecter';
    }
    if (err.name === 'JsonWebTokenError') {
        return 'Token invalide';
    }
    return 'Erreur de vérification du token';
};