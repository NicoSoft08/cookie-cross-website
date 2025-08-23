const express = require('express');
const { z } = require('zod');
const router = express.Router();

const { signupSchema, loginSchema } = require('../validations/schema');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { rateLimitAuth } = require('../middlewares/auth.middleware');

// register
router.post('/register', rateLimitAuth, async (req, res) => {
    try {
        const { email, password, username } = signupSchema.parse(req.body);
        const newUser = await authController.register(email, password, username);
        if (!newUser) {
            return res.status(409).json({ error: 'Utilisateur existe déjà ou donnée invalide.' });
        }

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: 'Erreur de session' });

            req.session.user = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            };

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Erreur en sauvegardant la session après register:', saveErr);
                    return res.status(500).json({ error: 'Erreur de session' });
                }
                return res.json({ ok: true, user: req.session.user });
            });
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Payload invalide', details: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// login
router.post('/login', rateLimitAuth, async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await authController.login(email, password);
        if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: 'Erreur de session' });

            req.session.user = user;

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Erreur en sauvegardant la session après login:', saveErr);
                    return res.status(500).json({ error: 'Erreur de session' });
                }
                return res.json({ ok: true, user: req.session.user });
            });
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Payload invalide', details: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// whoami
router.get('/whoami', rateLimitAuth, authenticate, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

// logout
router.post('/logout', rateLimitAuth, (req, res) => {
    const prod = process.env.NODE_ENV === 'production';
    const sessionCookieName = process.env.SESSION_NAME || 'adscity.sid';

    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la destruction de session:', err);
            return res.status(500).json({ ok: false, error: 'Impossible de se déconnecter' });
        }

        const cookieOptions = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: prod,
            ...(prod ? { domain: process.env.COOKIE_DOMAIN } : {}),
        };

        res.clearCookie(sessionCookieName, cookieOptions);
        res.json({ ok: true });
    });
});

// debug
router.get('/test-session', (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;