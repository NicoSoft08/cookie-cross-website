require('dotenv').config();

const prod = process.env.NODE_ENV === 'production';
const isLocalhost = process.env.HOSTNAME === 'localhost' || process.env.LOCAL_DEV === '1';

if (!process.env.SESSION_SECRET) {
    if (prod) {
        console.error('❌ SESSION_SECRET manquant en production, arrêt.');
        process.exit(1);
    } else {
        console.warn('⚠️ SESSION_SECRET non défini ; on utilise une valeur de dev faible.');
    }
}

const sessionOptions = {
    name: 'session',
    secret: process.env.SESSION_SECRET || 'dev-secret-fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 jour
        secure: prod && !isLocalhost,
        sameSite: prod ? 'none' : 'lax',
        ...(prod ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },
};

module.exports = sessionOptions;
