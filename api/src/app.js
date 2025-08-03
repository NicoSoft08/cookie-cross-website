const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');

// if (!process.env.SESSION_SECRET) {
//     console.error('❌ SESSION_SECRET non défini dans .env');
//     process.exit(1);
// }

const sessionOptions = require('./config/sessionConfig');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// CORS : front doit être explicitement autorisé
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002'
    ], // adapter selon ton front
    credentials: true,
}));

app.set('trust proxy', 1); // si derrière un reverse proxy (ex: Nginx)

app.use(session(sessionOptions));

// Sécuriser les headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Politique de referrer et permissions
app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

// Politique de permissions
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

app.use('/api/auth', authRoutes);


module.exports = app;
