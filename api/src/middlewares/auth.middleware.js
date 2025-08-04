exports.authenticate = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        console.warn('Session manquante pour', req.ip, req.originalUrl);
        return res.status(401).json({
            authenticated: false,
            reason: 'no_session',
            error: 'Not authenticated',
        });
    }
    req.user = req.session.user;
    next();
};

exports.requireRoles = (roles) => {
    const required = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                authenticated: false,
                reason: 'no_session',
                error: 'Not authenticated',
            });
        }
        const user = req.session.user;
        // On suppose que user.roles est un tableau de strings, ex: ['user','admin']
        const userRoles = Array.isArray(user.roles) ? user.roles : [];

        const has = required.some(r => userRoles.includes(r));
        if (!has) {
            return res.status(403).json({
                authenticated: true,
                reason: 'insufficient_role',
                error: 'Permission denied',
            });
        }

        req.user = user;
        next();
    };
};