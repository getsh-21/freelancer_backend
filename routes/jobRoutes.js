const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getJobs);
router.get('/my', protect, authorizeRoles('client'), getMyJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, authorizeRoles('client'), upload.array('attachments', 5), createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;