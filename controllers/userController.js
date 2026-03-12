const User = require('../models/User');
const mongoose = require('mongoose');

// Create or update user upon login from Firebase
const syncUser = async (req, res) => {
  try {
    if (!req.user) {
      console.error('syncUser: No user object found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { uid, email, name, picture } = req.user;
    console.log(`syncUser: Syncing user ${email} (${uid})`);
    
    // Fallback if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
       console.warn('Handling syncUser with mock DB since MongoDB is not connected.');
       return res.status(200).json({
          _id: "mock-" + uid,
          firebaseUID: uid,
          email: email,
          name: name || req.body.name || email.split('@')[0],
          profilePicture: picture || req.body.profilePicture || '',
          skills: [],
          headline: "Database not connected"
       });
    }

    let user = await User.findOne({ firebaseUID: uid });
    if (!user) {
      console.log(`syncUser: Creating new user for ${email}`);
      user = await User.create({
        firebaseUID: uid,
        email: email,
        name: name || req.body.name || email.split('@')[0],
        profilePicture: picture || req.body.profilePicture || ''
      });
    } else {
      console.log(`syncUser: Found existing user ${user._id}`);
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('syncUser Error details:', error);
    res.status(500).json({ 
      error: 'Server error syncing user',
      message: error.message 
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-firebaseUID');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Only allow user to update their own profile. We'll find by firebaseUID first
    const currentUser = await User.findOne({ firebaseUID: req.user.uid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const { name, headline, bio, skills, location, profilePicture } = req.body;
    
    let parsedSkills = currentUser.skills;
    if (skills) {
      if (Array.isArray(skills)) {
        parsedSkills = skills;
      } else if (typeof skills === 'string') {
        parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    currentUser.name = name !== undefined ? name : currentUser.name;
    currentUser.headline = headline !== undefined ? headline : currentUser.headline;
    currentUser.bio = bio !== undefined ? bio : currentUser.bio;
    currentUser.skills = parsedSkills;
    currentUser.location = location !== undefined ? location : currentUser.location;
    currentUser.profilePicture = profilePicture !== undefined ? profilePicture : currentUser.profilePicture;

    await currentUser.save();
    
    res.status(200).json(currentUser);
  } catch (error) {
    console.error('updateProfile Error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

module.exports = {
  syncUser,
  getUserProfile,
  getAllUsers,
  updateProfile
};
