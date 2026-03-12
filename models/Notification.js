const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: ['SKILL_MATCH', 'LIKE', 'COMMENT'],
    default: 'SKILL_MATCH'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
