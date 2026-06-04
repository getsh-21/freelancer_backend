const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getChatPartners } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('attachments', 3), sendMessage);
router.get('/partners', protect, getChatPartners);
router.get('/:userId', protect, getMessages);

module.exports = router;