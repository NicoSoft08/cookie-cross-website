const prod = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
    console.error('❌ SESSION_SECRET manquant en production, arrêt.');
    process.exit(1);
}

const sessionOptions = {
    name: 'session',
    secret: process.env.SESSION_SECRET, // obligatoire en prod
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: '.adscity.net',   // partage entre sous-domaines
        path: '/',
        httpOnly: true,
        secure: true,             // HTTPS uniquement
        sameSite: 'none',         // nécessaire pour cross-site (app.adscity.net ←→ api.adscity.net)
        maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
};

module.exports = sessionOptions;
