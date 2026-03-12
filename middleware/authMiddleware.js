const { admin, isFirebaseConfigured } = require('../config/firebase');
const User = require('../models/User');

const verifyFirebaseToken = async (req, res, next) => {
  if (!isFirebaseConfigured) {
    // For local dev without Firebase, attach a dummy user
    req.user = { uid: "dummy-local-user", email: "dummy@example.com" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized, no valid token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Optional: make sure user exists in Mongo, if needed globally.
    // For now just attach decoded token (uid, email)
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(403).json({ error: 'Unauthorized, invalid token' });
  }
};

module.exports = { verifyFirebaseToken };
