const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

// Routes

// Actions Admin sur les utilisateurs
router.get('/users', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.getUsers); // liste des utilisateurs
router.get('/users/:id', authenticate, requireRole("ADMIN"), adminController.getUserById); // détails d'un utilisateur
router.delete('/users/:id', authenticate, requireRole("ADMIN"), adminController.deleteUser); // suppression d'un utilisateur
router.patch('/users/:id/role', authenticate, requireRole('ADMIN'), adminController.updateUserRole); // mise à jour du rôle d'un utilisateur
router.patch('/users/:id/toggle-active', authenticate, requireRole('ADMIN'), adminController.toggleUserActive); // activation/désactivation d'un utilisateur
router.get('/users/:id/login-stats', authenticate, requireRole('ADMIN'), adminController.getUserLoginStats); // statistiques de connexion d'un utilisateur
router.get('/users/country-stats', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.getUsersCountries); // Statistiques des utilisateurs par pays

// Actions Admin sur les annonces
router.get('/listings', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.getListings); // liste des annonces
router.get('/listings/:id', authenticate, requireRole("ADMIN"), adminController.getListingById); // détails d'une annonce
router.delete('/listings/:id/delete', authenticate, requireRole("ADMIN"), adminController.deleteListing); // suppression d'une annonce
router.patch('/listings/:id/toggle-active', authenticate, requireRole('ADMIN'), adminController.toggleListingActive); // activation/désactivation d'une annonce
router.put('/listings/:id/approve', authenticate, requireRole("ADMIN"), adminController.approveListing); // approbation d'une annonce
router.put('/listings/:id/reject', authenticate, requireRole("ADMIN"), adminController.rejectListing); // rejet d'une annonce

// Actions Admin Système de Nettoyage
router.post('/cleanup', authenticate, requireRole("ADMIN"), adminController.cleanup); // Route pour déclencher manuellement le nettoyage (admin seulement)
router.get('/cleanup/stats', authenticate, requireRole("ADMIN"), adminController.getCleanupStats); // Obtenir les statistiques de nettoyage
router.post('/cleanup/run', authenticate, requireRole("ADMIN"), adminController.runCleanup); // Exécuter le nettoyage
router.post('/cleanup/run/:taskType', authenticate, requireRole("ADMIN"), adminController.runTaskTypeCleanup) // Exécuter une tache de nettoyage spécifique
router.get('/cleanup/history', authenticate, requireRole("ADMIN"), adminController.getCleanupHistory) // Obtenir l'historique des tâches de nettoyage
router.get('/cleanup/scheduled-status', authenticate, requireRole("ADMIN"), adminController.getScheduledStatus); // Obtenir le statut des tâches programmées

// Actions Admin sur les abonnements
router.get('/subscriptions', authenticate, requireRole("ADMIN"), adminController.getSubscriptions); // liste des abonnements
router.get('/subscriptions/stats', authenticate, requireRole("ADMIN"), adminController.getSubscriptionStats); // statistiques des abonnements
router.get('/subscriptions/user/:userId', authenticate, requireRole("ADMIN"), adminController.getUserSubscriptions); // abonnements d'un utilisateur
router.post('/subscriptions/user/:userId/force-expire', authenticate, requireRole("ADMIN"), adminController.forceExpireSubscription); // expiration forcée d'un abonnement
router.post('/subscriptions/user/:userId/suspend', authenticate, requireRole("ADMIN"), adminController.suspendSubscription); // suspension d'un abonnement
router.post('/subscriptions/user/:userId/unsuspend', authenticate, requireRole("ADMIN"), adminController.unsuspendSubscription); // réactivation d'un abonnement
router.post('/subscriptions/user/:userId/grant-subscription', authenticate, requireRole("ADMIN"), adminController.grantSubscription); //  Accorder un abonnement gratuit à un utilisateur

// Routes Admin sur les magasins
router.get('/stores', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.getStores); // liste des magasins
// router.get('/stores/:id', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.getStoreById); // détails d'un magasin
// router.delete('/stores/:id', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.deleteStore); // suppression d'un magasin
// router.patch('/stores/:id/toggle-active', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.toggleStoreActive); // activation/désactivation d'un magasin
router.post('/stores/:id/approve', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.approveStore); // approbation d'un magasin
// router.post('/stores/:id/reject', authenticate, requireRole("ADMIN", "SUPER_ADMIN"), adminController.rejectStore); // rejet d'un magasin

// Actions Admin sur les critiques
router.get('/reviews', authenticate, requireRole("ADMIN"), adminController.getReviews); // liste des critiques
router.delete('/reviews/:id', authenticate, requireRole("ADMIN"), adminController.deleteReviewById); // suppression d'une critique


// ROUTES SUPER ADMIN
router.post('/subscriptions/admin/plans', authenticate, requireRole("SUPER_ADMIN"), adminController.createSubscriptionPlan); // Créer un nouveau plan d'abonnement
router.put('/subscriptions/admin/plans/:planId', authenticate, requireRole("SUPER_ADMIN"), adminController.updateSubscriptionPlan); // Mettre à jour un plan d'abonnement
router.delete('/subscriptions/admin/plans/:planId', authenticate, requireRole("SUPER_ADMIN"), adminController.deactivateSubscriptionPlan); // Désactiver un plan d'abonnement
router.post('/subscriptions/run-renewals', authenticate, requireRole("SUPER_ADMIN"), adminController.runRenewalProcess); // Exécuter manuellement le processus de renouvellement
router.post('/subscriptions/process-expired', authenticate, requireRole("SUPER_ADMIN"), adminController.processExpiredSubscriptions);// Traiter manuellement les abonnements expirés
router.get('/subscriptions/revenue-report', authenticate, requireRole("SUPER_ADMIN"), adminController.getRevenueReport); // Générer un rapport de revenus

module.exports = router;