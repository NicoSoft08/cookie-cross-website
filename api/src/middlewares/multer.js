const multer = require('multer');

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Format de fichier non autorisé'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter,
});

module.exports = upload;
