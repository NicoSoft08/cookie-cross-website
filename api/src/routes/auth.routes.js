const express = require('express');
const { z } = require('zod');
const router = express.Router();

const { signupSchema, loginSchema } = require('../validations/schema');
const authController = require('../controllers/auth.controller');

// register
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = signupSchema.parse(req.body);
        const newUser = await authController.register(email, password, username);

        if (!newUser) {
            return res.status(409).json({ error: 'Utilisateur existe déjà ou donnée invalide.' });
        }

        // Régénérer session pour éviter fixation
        req.session.regenerate(async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur de session' });
            }

            req.session.user = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            };

            console.log(req.session.user)

            // Forcer la sauvegarde avant de répondre
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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await authController.login(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur de session' });
            }

            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username,
            };

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
router.get('/whoami', (req, res) => {
    console.log('Cookies:', req.headers.cookie);
    console.log('Session object:', req.session);
    
    if (!req.session?.user) {
        return res.status(401).json({ authenticated: false, reason: 'no_session', error: 'Not authenticated' });
    }
    res.json({ authenticated: true, user: req.session.user });
});

// logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la destruction de session:', err);
            return res.status(500).json({ ok: false, error: 'Impossible de se déconnecter' });
        }

        // Effacer le cookie : en dev tu peux omettre domain si problème
        const cookieOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'none',
        };
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }

        res.clearCookie('session', cookieOptions);
        res.json({ ok: true });
    });
});



router.get('/test-session', (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;