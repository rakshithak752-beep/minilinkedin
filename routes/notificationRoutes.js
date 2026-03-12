const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.get('/', verifyFirebaseToken, getNotifications);
router.put('/:id/read', verifyFirebaseToken, markAsRead);

module.exports = router;
