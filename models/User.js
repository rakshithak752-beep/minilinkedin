const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default: ""
  },
  headline: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  skills: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
