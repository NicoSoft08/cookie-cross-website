const pgSessionFactory = require('connect-pg-simple');

module.exports = (session) => {
    const prod = process.env.NODE_ENV === 'production';
    const pgSession = pgSessionFactory(session);

    const days = Number(process.env.SESSION_MAX_AGE_DAYS || 30);
    const maxAge = days * 24 * 60 * 60 * 1000;

    return {
        store: new pgSession({
            conString: process.env.DATABASE_URL,
            tableName: 'user_sessions',
            createTableIfMissing: true,
            // ttl en secondes (optionnel) — sinon basé sur cookie.maxAge
            // ttl: Math.floor(maxAge / 1000),
            errorLog: console.error,
        }),
        name: process.env.SESSION_NAME || 'adscity.sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: prod,       // Secure en prod (https)
            sameSite: 'lax',    // multi-sous-domaines = même site (ok)
            maxAge,
            ...(prod ? { domain: process.env.COOKIE_DOMAIN } : {}),
        },
    };
};