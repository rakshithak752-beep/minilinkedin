const express = require('express');
const router = express.Router();
const { syncUser, getUserProfile, getAllUsers, updateProfile } = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.post('/sync', verifyFirebaseToken, syncUser);
router.get('/', verifyFirebaseToken, getAllUsers);
router.get('/:id', verifyFirebaseToken, getUserProfile);
router.put('/profile', verifyFirebaseToken, updateProfile);

module.exports = router;
