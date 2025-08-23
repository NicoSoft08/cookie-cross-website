module.exports = function debugSession() {
    return (req, res, next) => {
        // Optionnel : n'activer qu'en dev ou via variable
        if (process.env.DEBUG_SESSION !== '1') return next();

        // Header origin / path / method
        console.log('--- SESSION DEBUG START ---');
        console.log('Time:', new Date().toISOString());
        console.log('Request:', req.method, req.originalUrl);
        console.log('Origin header:', req.headers.origin);
        console.log('Cookie header:', req.headers.cookie || '<none>');

        console.log('Headers:', req.headers);
        console.log('Body:', req.body);

        // Inspect session (non blocking)
        if (req.session) {
            // Copie minimale pour ne pas exposer autre chose
            const safeSession = {
                user: req.session.user || null,
                cookie: {
                    path: req.session.cookie?.path,
                    expires: req.session.cookie?._expires,
                    originalMaxAge: req.session.cookie?.originalMaxAge,
                    secure: req.session.cookie?.secure,
                    sameSite: req.session.cookie?.sameSite,
                },
            };
            console.log('Resolved session:', safeSession);
        } else {
            console.log('Session object: <undefined>');
        }

        console.log('--- SESSION DEBUG END ---');
        next();
    };
};
