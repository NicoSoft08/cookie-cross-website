const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const clickController = require('../controllers/click.contoller');
const { authenticate } = require('../middlewares/auth.middleware');


const LIMIT_MAX_REQUESTS = 5;
const LOGIN_LIMIT_MAX_REQUESTS = 5;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: LIMIT_MAX_REQUESTS // 5 requêtes max pour /me
});

// Rate limiting pour les tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: LOGIN_LIMIT_MAX_REQUESTS, // 5 tentatives par IP
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
router.post('/register', authController.register); // Route pour l'inscription
router.post('/signin', loginLimiter, authController.login); // Route pour la connexion
router.post('/refresh-token', authController.refreshToken); // Route pour la récupération d'un nouveau token
router.post('/logout', authenticate, authController.logout); // Route pour la déconnexion
router.get('/me', authenticate, authController.getProfile); // Route pour récupérer les informations de l'utilisateur connecté
router.get('/me/clicks/stats', authenticate, clickController.getGlobalStats); // // Statistiques globales pour l'utilisateur connecté
router.delete('/me/delete', authenticate, authController.deleteOwnAccount); // Route pour supprimer le compte de l'utilisateur connecté
router.post('/verify-code', authController.verifyCode); // Vérififer le code OTP
router.post('/send-otp-code', authenticate, authController.sendOTPCode); // Envoyer un code OTP
router.post('/resend-otp-code', authController.resendOTPCode); // Renvoyer un code OTP
router.post('/request-password-reset', authController.requestPasswordReset); // Demander une réinitialisation de mot de passe
router.post('/check-password-reset-token/:token', authController.checkPasswordResetToken); // Vérifier le token de réinitialisation de mot de passe
router.post('/reset-password', authController.resetPassword); // Réinitialiser le mot de passe
router.post('/verify-password', authenticate, authController.verifyPassword); // Vérifier le mot de passe de l'utilisateur connecté
router.get('/me/security-stats', authenticate, authController.getSecurityStats); // Récupérer les statistiques de sécurité de l'utilisateur connecté
router.get('/password-strength', authController.getPasswordStrength); // Vérifier la force du mot de passe
router.post('/verify-account', authenticate, authController.verifyAccount); // Vérifier le compte de l'utilisateur connecté
router.post('/add-recovery-email', authenticate, authController.addRecoveryEmail); // Ajouter une adresse e-mail de récupération

module.exports = router;