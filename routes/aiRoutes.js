const express = require('express');
const router = express.Router();
const { enhanceUserBio, enhancePostCaption } = require('../controllers/aiController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.post('/enhance-bio', verifyFirebaseToken, enhanceUserBio);
router.post('/enhance-caption', verifyFirebaseToken, enhancePostCaption);

module.exports = router;
