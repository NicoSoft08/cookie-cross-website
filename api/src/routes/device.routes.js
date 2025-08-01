const express = require('express');
const router = express.Router();

const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/:id', authenticate, deviceController.getDeviceByUserId); // Route pour récupérer les informations sur les appareils d'un utilisateur

module.exports = router;