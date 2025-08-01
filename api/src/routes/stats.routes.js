const express = require('express');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const statsController = require('../controllers/stats.controller');
const router = express.Router();

router.get('/overview', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getOverview);

router.get('/listings/count', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getListingCountByPeriod);
router.get('/listings/by-category', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getListingByCategory);
router.get('/listings/top', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getTopListings);

router.get('/users/registrations', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getUsersByRegistration);
router.get('/users/by-role', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getUsersByRole);
router.get('/users/activity-status', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getUsersByActivityStatus);

router.get('/stores/count', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getStoresCountByPeriod);
router.get('/stores/by-sector', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getStoresBySector);
router.get('/stores/top', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), statsController.getStoresTop);

module.exports = router;