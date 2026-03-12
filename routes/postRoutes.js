const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, commentPost } = require('../controllers/postController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', verifyFirebaseToken, upload.single('image'), createPost);
router.get('/', verifyFirebaseToken, getPosts);
router.post('/:id/like', verifyFirebaseToken, likePost);
router.post('/:id/comment', verifyFirebaseToken, commentPost);

module.exports = router;
