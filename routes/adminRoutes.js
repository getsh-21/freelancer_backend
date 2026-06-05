const express = require('express');
const router = express.Router();
const {
  getAnalytics, deleteUser, adminDeleteJob,
  promoteToAdmin, revokeAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All admin routes require login + admin or superadmin role
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.get('/analytics', getAnalytics);
router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', adminDeleteJob);

// Superadmin-only routes
router.put('/users/:id/promote', authorizeRoles('superadmin'), promoteToAdmin);
router.put('/users/:id/revoke', authorizeRoles('superadmin'), revokeAdmin);

module.exports = router;