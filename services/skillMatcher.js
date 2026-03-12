const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');

// A simple list of skills to detect
const SKILL_KEYWORDS = [
  'javascript', 'python', 'react', 'node.js', 'node', 'express', 
  'ai', 'machine learning', 'sql', 'docker', 'aws', 'java', 'c++', 
  'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'tailwind', 
  'mongodb', 'firebase', 'azure', 'kubernetes', 'graphql'
];

/**
 * Extracts skills from text based on a predefined list.
 */
const detectSkills = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  
  const detected = new Set();
  SKILL_KEYWORDS.forEach(skill => {
    // using word boundaries requires a bit of regex trick since skills might have special chars
    // simple includes might overmatch (e.g., matching 'go' in 'good'), let's just do regex with word boundary safely where possible
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      detected.add(skill);
    }
  });
  
  return Array.from(detected);
};

/**
 * Checks for matches and creates notifications
 */
const matchSkillsAndNotify = async (postAuthorId, newlyDetectedSkills) => {
  if (!newlyDetectedSkills || newlyDetectedSkills.length === 0) return;

  try {
    // 1. Find other users who have ANY of these skills in their profile
    // Make sure we do not notify the author themselves
    const matchedUsers = await User.find({
      _id: { $ne: postAuthorId },
      skills: { $in: newlyDetectedSkills }
    });
    
    // We could also check who mentioned it in previous posts, but User profile skills is the primary requirement.
    // "Check other users who listed the same skill OR mentioned it in previous posts"
    
    const matchedUserIds = new Set(matchedUsers.map(u => u._id.toString()));

    const postsWithSkills = await Post.find({
      authorId: { $ne: postAuthorId },
      detectedSkills: { $in: newlyDetectedSkills }
    }).select('authorId');

    postsWithSkills.forEach(p => matchedUserIds.add(p.authorId.toString()));

    const author = await User.findById(postAuthorId);
    if (!author) return;

    // Create notifications for all unique matched users
    const notificationsToCreate = [];
    for (const userId of matchedUserIds) {
      notificationsToCreate.push({
        userId,
        relatedUser: postAuthorId,
        type: 'SKILL_MATCH',
        message: `You and ${author.name} both mentioned/have skills like ${newlyDetectedSkills.join(', ')}. Consider connecting since you share similar skills.`
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
    
  } catch (error) {
    console.error('Error in matchSkillsAndNotify:', error);
  }
};

module.exports = {
  SKILL_KEYWORDS,
  detectSkills,
  matchSkillsAndNotify
};
