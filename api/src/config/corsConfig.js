const allowLocalhost = process.env.CORS_ALLOW_LOCALHOST === '1';

const isAllowedOrigin = (origin) => {
    try {
        if (!origin) return true; // ex: apps mobiles / cURL
        const { hostname, protocol } = new URL(origin);

        // Autoriser tous les sous-domaines *.adscity.net
        const adscity =
            hostname === 'adscity.net' || hostname.endsWith('.adscity.net');

        // Dev local (optionnel)
        const local =
            allowLocalhost &&
            protocol.startsWith('http') &&
            (hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                /^localhost\.?\d*$/.test(hostname));

        return adscity || local;
    } catch {
        return false;
    }
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        console.warn('🚫 CORS refusé pour origine :', origin);
        return callback(new Error('CORS not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
};

module.exports = { corsOptions };
