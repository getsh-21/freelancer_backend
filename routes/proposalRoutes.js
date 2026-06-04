const express = require('express');
const router = express.Router();
const { submitProposal, getJobProposals, updateProposal, getMyProposals } = require('../controllers/proposalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('freelancer'), submitProposal);
router.get('/my', protect, authorizeRoles('freelancer'), getMyProposals);
router.get('/job/:jobId', protect, getJobProposals);
router.put('/:id', protect, authorizeRoles('client'), updateProposal);

module.exports = router;