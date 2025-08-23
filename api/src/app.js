const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet');
const buildSessionOptions = require('./config/sessionConfig');
const { corsOptions } = require('./config/corsConfig');
const authRoutes = require('./routes/auth.routes');
const debugSession = require('./config/debugSession');

const app = express();
const prod = process.env.NODE_ENV === 'production';

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS (laisse gérer OPTIONS automatiquement)
app.use(cors(corsOptions));

// Corps & cookies
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Trust proxy (nécessaire derrière un reverse proxy pour Secure cookies)
if (prod) app.set('trust proxy', 1);

// Sessions (store Postgres)
app.use(session(buildSessionOptions(session)));

// (optionnel) debug des sessions — à retirer en vraie prod
if (process.env.DEBUG_SESSION === '1') app.use(debugSession());

// CSRF: protège toutes les méthodes non-GET/HEAD/OPTIONS
// Le token est stocké en cookie httpOnly; on expose une route pour que le front le lise et l’envoie dans l’en-tête "x-csrf-token"
app.use(csrf({
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: prod,
        ...(prod ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },
}));

// Route pour récupérer le token CSRF
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/api/auth', authRoutes);

// Gestion d’erreurs CSRF lisible
app.use((err, _req, res, _next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;