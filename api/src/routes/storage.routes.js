const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storage.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer');

router.post('/post-image/upload', authenticate, upload.single('image'), storageController.uploadPostImage);

module.exports = router;