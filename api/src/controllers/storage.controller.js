const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = require('../utils/cloudinaryUpload');

// Limite de concurrence Cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier reçu.'
            });
        }

       
    } catch (error) {
        console.error('[UPLOAD POST IMAGE ERROR]', error);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};