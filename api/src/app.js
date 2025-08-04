const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');

const sessionOptions = require('./config/sessionConfig');
const { corsOptions, whitelist } = require('./config/corsConfig');
const authRoutes = require('./routes/auth.routes');
const debugSession = require('./config/debugSession');

const app = express();

// 1. CORS pour requêtes normales
app.use(cors(corsOptions));

// 2. Middleware personnalisé pour gérer les OPTIONS proprement
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        if (origin && whitelist.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.sendStatus(204);
        } else {
            console.warn('OPTIONS refusé pour origine :', origin);
            return res.sendStatus(403);
        }
    }
    next();
});

app.use(express.json());
app.use(helmet());

// Rest of your configuration...
app.set('trust proxy', 1);
app.use(session(sessionOptions));

app.use(debugSession());

// Security headers...
app.use('/api/auth', authRoutes);

module.exports = app;