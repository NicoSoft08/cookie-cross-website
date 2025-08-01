const multer = require('multer');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Configuration du stockage pour les images d'annonces
const adImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'adscity/listings',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const userId = req.user?.id || 'anonymous';
            return `listing_${userId}_${timestamp}_${Math.random().toString(36).substring(7)}`;
        }
    }
});

// Configuration du stockage pour les avatars utilisateurs
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'adscity/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
        public_id: (req, file) => {
            const userId = req.user?.id || 'anonymous';
            return `avatar_${userId}_${Date.now()}`;
        }
    }
});

// Configuration du stockage pour les documents
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'adscity/documents',
        allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
        resource_type: 'raw',
        public_id: (req, file) => {
            const timestamp = Date.now();
            const userId = req.user?.id || 'anonymous';
            return `doc_${userId}_${timestamp}_${file.originalname.split('.')[0]}`;
        }
    }
});

// Middleware Multer pour les images d'annonces
const uploadAdImages = multer({
    storage: adImageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB par fichier
        files: 10 // Maximum 10 fichiers
    },
    fileFilter: (req, file, cb) => {
        // Vérifier le type MIME
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées'), false);
        }
    }
});

// Middleware Multer pour les avatars
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées pour l\'avatar'), false);
        }
    }
});

// Middleware Multer pour les documents
const uploadDocuments = multer({
    storage: documentStorage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de document non autorisé'), false);
        }
    }
});

module.exports = {
    cloudinary,
    uploadAdImages,
    uploadAvatar,
    uploadDocuments
};