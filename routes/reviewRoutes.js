const express = require('express');
const router = express.Router();
const { createReview, getFreelancerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('client'), createReview);
router.get('/:freelancerId', getFreelancerReviews);

module.exports = router;