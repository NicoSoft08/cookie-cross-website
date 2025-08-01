const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');


router.get('/public-key', notificationController.getPublicKey);
router.post('/subscribe', authenticate, notificationController.subscribe);
router.post('/notify', authenticate, notificationController.notify);
router.get('/users/:id', authenticate, notificationController.getNotificationByUserId);

module.exports = router;