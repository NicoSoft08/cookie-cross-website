const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

router.post('/initiate', authenticate, paymentController.initiatePayment);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.post('/confirm/:id', authenticate, paymentController.confirmPayment);

module.exports = router;