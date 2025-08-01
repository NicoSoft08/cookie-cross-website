const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Routes Public
router.get('/', subscriptionController.getSubscriptionPlans); // Obtenir les plans d'abonnement
router.get('/plans/:planId', subscriptionController.getSubscriptionPlanById); // Obtenir un plan d'abonnement par ID

// Routes Privées
router.get('/my-subscription', authenticate, subscriptionController.getCurrentSubscription); // Obtenir l'abonnement actuel de l'utilisateur
router.get('/my-history', authenticate, subscriptionController.getSubscriptionHistory); // Obtenir l'historique des abonnements de l'utilisateur
router.get('/my-payments', authenticate, subscriptionController.getPaymentHistory); // Récupérer l'historique des paiements de l'utilisateur
router.post('/subscribe', authenticate, subscriptionController.createSubscription); // Créer un nouvel abonnement
router.post('/change-plan', authenticate, subscriptionController.changeSubscriptionPlan); // Changer de plan d'abonnement
router.post('/cancel', authenticate, subscriptionController.cancelSubscription); // Annuler un abonnement
router.post('/reactivate', authenticate, subscriptionController.reactivateSubscription); // Réactiver un abonnement annulé
router.post('/toggle-auto-renew', authenticate, subscriptionController.toggleAutoRenew); // Activer/désactiver le renouvellement automatique

// Routes de paiement
router.post('/payments/process', authenticate, subscriptionController.processPayment); // Traiter un paiement
router.post('/payments/retry/:paymentId', authenticate, subscriptionController.retryPayment); // Relancer un paiement échoué
router.get('/payments/:paymentId', authenticate, subscriptionController.getPaymentDetails) // Récupérer les détails d'un paiement

router.post('/renew', authenticate, subscriptionController.renewSubscriptions); // Renouveler un abonnement
router.post('/expire', authenticate, subscriptionController.expireSubscription); // Expirer un abonnement
router.post('/process-expired', authenticate, subscriptionController.retryPayment); // Traiter les abonnements expirés
router.get('/stats', authenticate, subscriptionController.getSubscriptionStats); // Obtenir les statistiques des abonnements


module.exports = router;