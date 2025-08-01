const bcrypt = require('bcrypt');
const { PrismaClient } = require('../generated/prisma');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const VerificationCodeService = require('../services/verificationCode.service');
const { validationResult } = require('express-validator');
const PasswordResetService = require('../services/passwordReset.service');
const { verifyCaptcha } = require('../middlewares/auth.middleware');
const EmailService = require('../services/email.service');
const AuthLoggerService = require('../services/auth-logger.service');
const AccountVerificationCodeService = require('../services/account-verification-code.service');
const { success } = require('zod/v4');
const ActivityService = require('../services/activity.service');
const ActivityTypes = require('../constants/activityTypes');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
    const { email, password, phoneNumber, firstName, lastName, displayName, captchaToken } = req.body;

    // Messages d'erreur standardisés
    const ERROR_CODES = {
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        CAPTCHA_REQUIRED: 'CAPTCHA_REQUIRED',
        SERVER_ERROR: 'SERVER_ERROR'
    };

    const result = await validateEmail(email);

    if (result.is_disposable_email) {
        return res.status(400).json({
            success: false,
            message: "Les adresses email temporaires ne sont pas autorisées."
        });
    }

    if (!email || !password) {
        console.log('email or password is missing');
        return res.status(400).json({
            success: false,
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: "Email et mot de passe sont requis"
        });
    }

    // Vérification CAPTCHA
    if (!captchaToken) {
        console.log('captcha token is missing');
        return res.status(400).json({
            success: false,
            code: ERROR_CODES.CAPTCHA_REQUIRED,
            message: "Vérification CAPTCHA requise"
        });
    }

    if (!phoneNumber || !firstName || !lastName || !displayName) {
        console.log('required fields are missing');
        return res.status(400).json({
            success: false,
            message: "Tous les champs requis sont obligatoires"
        });
    }

    const captchaVerification = await verifyCaptcha(captchaToken);
    if (!captchaVerification.success) {
        console.log('captcha verification failed');
        return res.status(400).json({
            success: false,
            code: ERROR_CODES.CAPTCHA_REQUIRED,
            message: "CAPTCHA invalide"
        });
    }

    try {
        const existing = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Créer l'utilisateur (non vérifié)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                displayName,
                country: null,
                city: null,
                address: null,
                role: 'USER',
                emailVerified: false,
                isProfilePublic: true,
                showPhoneNumber: false,
                preferredLanguage: 'fr',
                emailNotifications: true,
                smsNotifications: false,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                displayName: true,
                country: true,
                city: true,
                address: true,
                role: true,
                emailVerified: true,
                isProfilePublic: true,
                showPhoneNumber: true,
                preferredLanguage: true,
                emailNotifications: true,
                smsNotifications: true,
                createdAt: true
            }
        });

        // Générer et envoyer le code de vérification
        const codeResult = await VerificationCodeService.createCode(
            email,
            'EMAIL_VERIFICATION',
            user.id
        );

        if (codeResult.success) {
            // Send the code to the user's email
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h à partir de maintenant

            await EmailService.sendEmailWithVerificationCode(user.email, user.firstName, user.lastName, codeResult.code, expiresAt);

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à votre email.',
                data: {
                    user,
                    needsVerification: true
                }
            });
        } else {
            // Si l'envoi du code échoue, supprimer l'utilisateur créé
            await prisma.user.delete({ where: { id: user.id } });

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi du code de vérification'
            });
        }
    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.login = async (req, res) => {
    const {
        email, password, captchaValue, rememberMe,
        ip, browser, os, device, isTablet, isMobile, isBot
    } = req.body;

    try {
        // 1. Validation basique
        if (!email || !password) {
            await AuthLoggerService.logAttempt(null, ip, browser, os, device, isTablet, isMobile, isBot, 'FAILURE', 'Champs manquants');
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        // 2. Vérification CAPTCHA
        if (!captchaValue || !(await verifyCaptcha(captchaValue)).success) {
            await AuthLoggerService.logAttempt(null, ip, browser, os, device, isTablet, isMobile, isBot, 'FAILURE', 'CAPTCHA invalide');
            return res.status(400).json({ message: 'CAPTCHA invalide ou manquant.' });
        }

        // 3. Recherche utilisateur
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            await AuthLoggerService.logAttempt(user?.id || null, ip, browser, os, device, isTablet, isMobile, isBot, 'FAILURE', 'Identifiants invalides');
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Email non vérifié', needsEmailVerification: true });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Compte désactivé. Contactez le support.' });
        }

        // 4. Localisation
        const location = await AuthLoggerService.fetchLocation(ip);

        // 5. Cas : Première connexion → Trusted Device
        const isFirstLogin = user.loginCount === 0;
        if (isFirstLogin) {
            await prisma.deviceSession.create({
                data: {
                    userId: user.id,
                    ip,
                    country: location?.country,
                    city: location?.city,
                    browser,
                    os,
                    device,
                    isTablet,
                    isMobile,
                    isBot,
                    lastUsed: new Date(),
                    verified: true,
                    trusted: true,
                }
            });

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    loginCount: { increment: 1 },
                    country: location?.country,
                    city: location?.city,
                }
            });

            await ActivityService.logActivity(user.id, ActivityTypes.LOGIN_SUCCESS, {
                ip, browser, os, device,
                location: `${location?.city}, ${location?.country}`
            });

            await prisma.securityLog.create({
                data: {
                    userId: user.id,
                    alertType: 'first_login',
                    severity: 'low',
                    message: 'Première connexion',
                    ip, browser, os, device,
                    city: location?.city, country: location?.country,
                    triggeredBy: 'system',
                    acknowledged: false,
                }
            });
        }

        // 6. Analyse comportementale (si pas première connexion)
        if (!isFirstLogin) {
            const suspicious = await AuthLoggerService.analyzeSuspiciousActivity(user.id, ip, device);

            if (suspicious.isSuspicious) {
                await AuthLoggerService.logAttempt(user.id, ip, browser, os, device, isTablet, isMobile, isBot, 'FAILURE', `Activité suspecte : ${suspicious.reason}`);

                await prisma.securityLog.create({
                    data: {
                        userId: user.id,
                        alertType: suspicious.type,
                        severity: suspicious.severity,
                        message: suspicious.reason,
                        ip, browser, os, device,
                        country: suspicious.currentCountry ?? null,
                        city: suspicious.currentCity ?? null,
                        triggeredBy: 'system',
                        acknowledged: false,
                    }
                });

                await EmailService.sendSecurityAlert(
                    user.email,
                    user.firstName,
                    user.lastName,
                    ip, browser, os, device,
                    location?.country ?? null, location?.city ?? null
                );

                if (suspicious.severity === 'high') {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { isActive: false },
                    });
                    return res.status(403).json({
                        message: 'Activité critique détectée. Votre compte a été temporairement désactivé.',
                        needsAccountVerification: true,
                    });
                }

                return res.status(403).json({
                    message: 'Activité suspecte détectée. Vérification requise.',
                    needsAccountVerification: true,
                });
            }
        }

        // 7. Génération des tokens
        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload, rememberMe ? '30d' : '1d');

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000),
            }
        });

        // 8. Session d'appareil (upsert)
        const session = await prisma.deviceSession.upsert({
            where: {
                userId_ip_browser_os_device: {
                    userId: user.id,
                    ip, browser, os, device,
                }
            },
            create: {
                userId: user.id, ip, browser, os, device,
                country: location?.country, city: location?.city,
                isTablet, isMobile, isBot,
                lastUsed: new Date(),
                verified: true
            },
            update: {
                ip, country: location?.country, city: location?.city,
                lastUsed: new Date(),
            }
        });

        // 9. Mises à jour supplémentaires
        await prisma.email.updateMany({
            where: { userId: user.id },
            data: {
                lastUsed: new Date(),
                verified: true,
                isLoginAllowed: true,
            }
        });

        // ✅ Mettre à jour la date de dernière connexion
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // 10. Cookies sécurisés: 🔐 Définir un cookie HTTP-only
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
           sameSite: 'None',
            domain: '.adscity.net',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        res.cookie('currentDeviceSessionId', session.id, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.adscity.net',
            path: '/',
            maxAge: rememberMe ? 30 * 86400000 : 86400000
        });

        // 11. Logging final
        await AuthLoggerService.logAttempt(user.id, ip, browser, os, device, isTablet, isMobile, isBot, 'SUCCESS', 'Connexion réussie');
        await ActivityService.logActivity(user.id, ActivityTypes.LOGIN_SUCCESS, {
            ip, browser, os, device,
            location: `${location?.city}, ${location?.country}`
        });

        return res.json({
            success: true,
            message: 'Connexion réussie',
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            deviceSessionId: session.id
        });

    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        await AuthLoggerService.logAttempt(null, ip, browser, os, device, isTablet, isMobile, isBot, 'FAILURE', 'Erreur interne');
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.refreshToken = async (req, res) => {

};

exports.logout = async (req, res) => {
    // Ajouter le token à la blacklist
};

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                emailVerified: true,
                phoneNumber: true,
                isActive: true,
                isOnline: true,
                lastOnline: true,
                avatar: true,
                gender: true,
                genderVisibility: true,
                workAddress: true,
                createdAt: true,
                isProfilePublic: true,
                preferredLanguage: true,
                showPhoneNumber: true,
                emailNotifications: true,
                smsNotifications: true,
                pushNotifications: true,
                followedStores: true,
                country: true,
                city: true,
                address: true,
                storeId: true,
                store: {
                    select: {
                        name: true,
                        avatar: true,
                        slug: true,
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        res.json(user)
    } catch (error) {
        console.error('Erreur /me:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
}

exports.deleteOwnAccount = async (req, res) => {
    try {

        res.json(user);
    } catch (error) {
        console.error('Erreur /me:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
}

exports.deleteOwnAccount = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Soft delete account
        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                active: false
            }
        });

        // Hard delete account
        // await prisma.user.delete({
        //     where: {
        //         id: req.user.id
        //     }
        // });

        res.status(200).json({ message: 'Compte supprimé avec succès.' });
    } catch (error) {
        console.error('[DELETE OWN ACCOUNT ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation des données
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email et code sont requis'
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si l'email est déjà vérifié
        if (user.emailVerified) {
            console.log('Email déjà vérifié');
            return res.status(400).json({
                success: false,
                message: 'Email déjà vérifié'
            });
        }

        // Vérifier le code
        const verificationResult = await VerificationCodeService.verifyCode(
            email,
            code,
            'EMAIL_VERIFICATION'
        );

        if (!verificationResult.success) {
            console.log('Code invalide');
            return res.status(400).json({
                success: false,
                message: verificationResult.message
            });
        }

        // Marquer l'email comme vérifié
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { emailVerified: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true
            }
        });

        // Ajouter l'email de User dans les adresses
        await prisma.email.create({
            data: {
                userId: updatedUser.id,
                email: updatedUser.email,
                verified: updatedUser.emailVerified,
                isLoginAllowed: true,
                createdAt: new Date(),
                type: 'PRIMARY',
            }
        })


        // Générer le token JWT
        const accessToken = generateAccessToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

        res.json({
            success: true,
            message: 'Email vérifié avec succès',
            data: {
                user: updatedUser,
                accessToken
            }
        });
    } catch (error) {
        console.error('[VERIFY CODE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.sendOTPCode = async (req, res) => {
    const { email } = req.body;
    const user = req.user;

    console.log('user', user, "email", email);

    try {
        // Vérifier que l'email n'est pas déjà utilisée
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà utilisée'
            });
        }

        // Générer le code
        const { correctCode, choices } = await AccountVerificationCodeService.generateVerificationCode(user.id);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes à partir de maintenant

        // Envoyer le code par email ici via un service email
        await EmailService.sendTwoDigitChallenge(email, user.firstName, user.lastName, correctCode, expiresAt);

        res.status(200).json({
            success: true,
            message: 'Code envoyé avec succès',
            codes: choices
        });
    } catch (error) {
        console.error('[SEND CODE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.resendOTPCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email requis'
        });
    }

    try {
        // Vérifier que l'email n'est pas déjà utilisée
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Supprimer les anciens codes non utilisés
        await prisma.verificationCode.deleteMany({
            where: {
                userId: existingUser.id,
                type: 'EMAIL_VERIFICATION',
                isUsed: false
            }
        });

        // Générer un nouveau code et envoyer le code de vérification
        const codeResult = await VerificationCodeService.createCode(
            email,
            'EMAIL_VERIFICATION',
            existingUser.id
        );

        if (codeResult.success) {
            // Send the code to the user's email
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h à partir de maintenant

            await EmailService.sendEmailWithVerificationCode(existingUser.email, existingUser.firstName, existingUser.lastName, codeResult.code, expiresAt);

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à votre email.',
                data: {
                    existingUser,
                    needsVerification: true
                }
            });
        } else {
            // Si l'envoi du code échoue, supprimer l'utilisateur créé
            await prisma.user.delete({ where: { id: existingUser.id } });

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi du code de vérification'
            });
        }
    } catch (error) {
        console.error('[RESEND CODE ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });

    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({ message: "Données invalides", errors: erros.array() });
        }

        const { email, captchaValue } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        if (!email) {
            await AuthLoggerService.logAttempt(null, ip, userAgent, 'FAILURE', 'Email manquant');
            return res.status(400).json({
                success: false,
                message: "Email requis"
            });
        }

        // Vérification CAPTCHA
        if (!captchaValue) {
            await AuthLoggerService.logAttempt(null, ip, userAgent, 'FAILURE', 'CAPTCHA manquant');
            return res.status(400).json({
                success: false,
                message: "Vérification CAPTCHA requise"
            });
        }

        const captchaVerification = await verifyCaptcha(captchaValue);
        if (!captchaVerification.success) {
            await AuthLoggerService.logAttempt(null, ip, userAgent, 'FAILURE', 'CAPTCHA invalide');
            return res.status(400).json({
                success: false,
                message: "CAPTCHA invalide"
            });
        }

        const result = await PasswordResetService.requestPasswordReset(
            email,
            ipAddress,
            userAgent
        );

        // Toujours renvoyer 200 pour éviter l'énumération d'emails
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('[REQUEST PASSWORD RESET ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.checkPasswordResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de réinitialisation de mot de passe requis'
            });
        }

        const result = await PasswordResetService.validateResetToken(token);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token valide',
            data: {
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName
            }
        });
    } catch (error) {
        console.error('[CHECK PASSWORD RESET TOKEN ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { token, password, confirmPassword } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await PasswordResetService.resetPassword(token, password, confirmPassword, ipAddress);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('[RESET PASSWORD ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.verifyPassword = async (req, res) => {
    const { password } = req.body;
    const user = req.user;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Mot de passe requis'
        });
    }

    try {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe incorrect'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mot de passe valide'
        });
    } catch (error) {
        console.error('[VERIFY PASSWORD ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}

exports.getSecurityStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await PasswordResetService.getSecurityStats(userId);

        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'Statistiques de sécurité non trouvées'
            });
        }

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[GET SECURITY STATS ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.getPasswordStrength = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe requis'
            });
        }

        const validation = PasswordResetService.validatePasswordStrength(password);

        res.status(200).json({
            success: true,
            data: {
                valid: validation.valid,
                message: validation.message || 'Mot de passe valide',
                strength: this.calculatePasswordStrength(password)
            }
        });
    } catch (error) {
        console.error('[GET PASSWORD STRENGTH ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}

exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà vérifié'
            });
        }

        // Générer un nouveau code
        const codeResult = await VerificationCodeService.createCode(
            email,
            'EMAIL_VERIFICATION',
            user.id
        );

        if (codeResult.success) {
            // Send the code to the user's email
            const mailSubject = 'Code de vérification';
            const mailText = `
                Bonjour ${user.firstName} ${user.lastName},
                
                Veuillez utiliser le code suivant pour vérifier votre compte : ${codeResult.code}
            
                Merci d'utiliser AdsCity.

                Cordialement,
                L'équipe AdsCity
            `;

            await sendMail({
                to: user.email,
                subject: mailSubject,
                text: mailText,
            });

            res.json({
                success: true,
                message: 'Nouveau code envoyé avec succès'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi du code'
            });
        }

    } catch (error) {
        console.error('[RESEND CODE ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.verifyAccount = async (req, res) => {
    const { code } = req.body;
    const user = req.user;

    try {
        const verificationResult = await AccountVerificationCodeService.verifyCode(code, user.id);
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                message: verificationResult.message
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isActive: true }
        });

        await prisma.securityLog.create({
            data: {
                userId: user.id,
                alertType: 'account_activated',
                severity: 'low',
                message: verificationResult.message,
                triggeredBy: 'user',
                acknowledged: false,
                ip: null,
                browser: null,
                device: null,
                os: null,
                createdAt: new Date()
            }
        })

        res.status(200).json({
            success: true,
            message: verificationResult.message
        });
    } catch (error) {
        console.error('[VERIFY ACCOUNT ERROR]', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.addRecoveryEmail = async (req, res) => {
    const user = req.user;
    const { email, type } = req.body;

    if (!email || !type) {
        return res.status(400).json({
            success: false,
            message: 'Email et type requis'
        });
    }

    try {
        await prisma.email.create({
            data: {
                userId: user.id,
                email: email,
                type: type.toUpperCase(),
                verified: true,
                addedAt: new Date()
            }
        });

        // Enregistrement de l'événement dans la table security_log
        await prisma.securityLog.create({
            data: {
                userId: user.id,
                alertType: 'email_added',
                severity: 'low',
                message: `Email ${email} ajouté avec succès`,
                triggeredBy: 'user',
                acknowledged: false,
                ip: null,
                browser: null,
                device: null,
                os: null,
                createdAt: new Date()
            }
        })

        res.status(200).json({
            success: true,
            message: 'Email ajouté avec succès'
        });
    } catch (error) {
        console.error('[ADD RECOVERY EMAIL ERROR]', error);

        // Cas où cet email est déjà utilisé par ce user
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà enregistré par ce compte'
            });
        }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}