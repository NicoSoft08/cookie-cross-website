const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const activityController = require('../controllers/activity.controller');
const router = express.Router();

router.get('/users/:id', authenticate, activityController.getUserActivityLogs); // Récupérer les logs d'activité d'un utilisateur

module.exports = router;