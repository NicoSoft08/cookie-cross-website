const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const helmet = require('helmet');
const webpush = require('web-push');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const listingRoutes = require('./routes/listing.routes');
const categoryRoutes = require('./routes/category.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const clickRoutes = require('./routes/click.routes');
const reviewRoutes = require('./routes/review.routes');
const deviceRoutes = require('./routes/device.routes');
const activityRoutes = require('./routes/activity.routes');
const formSchemaRoutes = require('./routes/form-schema.routes');
const storeRoutes = require('./routes/store.routes');
const planRoutes = require('./routes/plan.routes');
const storageRoutes = require('./routes/storage.routes');
const notificationRoutes = require('./routes/notification.routes');
const cityRoutes = require('./routes/city.routes');
const suggestionsRoutes = require('./routes/suggestions.routes');
const paymentRoutes = require('./routes/payment.routes');
const statsRoutes = require('./routes/stats.routes');
const brandRoutes = require("./routes/brand.routes");

// Service
const EmailService = require('./services/email.service');

const app = express();

// 🌍 Configuration CORS
const allowedOrigins = [
    'https://adscity.net',
    'https://admin.adscity.net',
    'https://auth.adscity.net',
    'https://account.adscity.net',
    'https://dashboard.adscity.net',
    'https://help.adscity.net',
    'https://api.adscity.net', // 👈 à ajouter si c’est là que tourne ton backend
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:4000',
    'http://192.168.31.252:3000',
    'http://192.168.31.114:3000',
    'http://192.168.31.252:4000'
]

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Content-Length'], // Important for images
    maxAge: 86400,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

webpush.setVapidDetails(
    'mailto:support@adscity.net',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// 🛡 Middlewares
app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // À restreindre davantage
        styleSrc: ["'self'", "'unsafe-inline'"],
    }
}));
app.use(helmet.noSniff());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Middleware pour logger les requêtes (utile pour le debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.use((req, res, next) => {
    const visit = {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
    };

    console.log('Visit:', visit);

    next();
});

app.post('/api/test/alert-security', async (req, res) => {
    const { email, firstName, lastName } = req.body;

    const code = 25;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
        await EmailService.sendTwoDigitChallenge(email, firstName, lastName, code, expiresAt);
        res.status(200).json({ message: 'Email de réinitialisation envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation :', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de réinitialisation' });
    }
});

app._router?.stack
    .filter(r => r.route)
    .map(r => console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/clicks', clickRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/form-schema', formSchemaRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/storages', storageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use("/api/brands", brandRoutes);

module.exports = app;