const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { detectSkills, matchSkillsAndNotify } = require('../services/skillMatcher');

const createPost = async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUID: req.user.uid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const { caption } = req.body;
    let imageUrl = '';

    // Handle Cloudinary upload if file is attached
    if (req.file) {
      // Return a promise from cloudinary stream upload
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'mini-ai-linkedin/posts' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = await uploadPromise;
    }

    const detectedSkills = detectSkills(caption);

    const newPost = await Post.create({
      authorId: currentUser._id,
      caption,
      imageUrl,
      detectedSkills
    });

    // Run skill matching asynchronously
    matchSkillsAndNotify(currentUser._id, detectedSkills);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('createPost Error:', error);
    res.status(500).json({ error: 'Server error creating post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'name profilePicture headline')
      .sort({ createdAt: -1 });

    // For better API, let's also attach comments for each post
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ postId: post._id })
        .populate('userId', 'name profilePicture');
      return { ...post.toObject(), comments };
    }));

    res.status(200).json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching posts' });
  }
};

const likePost = async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUID: req.user.uid });
    const post = await Post.findById(req.params.id);
    if (!post || !currentUser) return res.status(404).json({ error: 'Not found' });

    const hasLiked = post.likes.includes(currentUser._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== currentUser._id.toString());
    } else {
      post.likes.push(currentUser._id);
      
      // Notify author if not self
      if (post.authorId.toString() !== currentUser._id.toString()) {
        await Notification.create({
          userId: post.authorId,
          relatedUser: currentUser._id,
          type: 'LIKE',
          message: `${currentUser.name} liked your post.`
        });
      }
    }
    
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error liking post' });
  }
};

const commentPost = async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUID: req.user.uid });
    const post = await Post.findById(req.params.id);
    if (!post || !currentUser) return res.status(404).json({ error: 'Not found' });

    const { commentText } = req.body;
    if (!commentText) return res.status(400).json({ error: 'Comment text is required' });

    const comment = await Comment.create({
      postId: post._id,
      userId: currentUser._id,
      commentText
    });

    // Notify author if not self
    if (post.authorId.toString() !== currentUser._id.toString()) {
      await Notification.create({
        userId: post.authorId,
        relatedUser: currentUser._id,
        type: 'COMMENT',
        message: `${currentUser.name} commented on your post: "${commentText.substring(0, 30)}..."`
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name profilePicture');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error commenting on post' });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentPost
};
