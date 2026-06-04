const express = require('express');
const router = express.Router();
const { getAnalytics, deleteUser, adminDeleteJob, promoteToAdmin, demoteFromAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/analytics', getAnalytics);
router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', adminDeleteJob);

// Super admin only
router.put('/users/:id/promote', promoteToAdmin);
router.put('/users/:id/demote', demoteFromAdmin);

module.exports = router;