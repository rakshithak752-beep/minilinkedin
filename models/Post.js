const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    required: false,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  detectedSkills: {
    type: [String],
    default: []
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
