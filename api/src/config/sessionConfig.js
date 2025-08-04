const prod = process.env.NODE_ENV === 'production';
const isLocalhost = process.env.LOCAL_DEV === '1' || process.env.NODE_ENV !== 'production';

const sessionOptions = {
    name: 'session',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,            // HTTPS requis ; mkcert le fournit localement
        sameSite: 'lax',          // nécessaire pour cross-subdomain
        // en local on **n’impose pas domain** pour éviter les subtilités ; en prod :
        ...(prod && !isLocalhost ? { domain: '.adscity.net' } : {}),
    },
};
module.exports = sessionOptions;