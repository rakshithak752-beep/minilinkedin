const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin based on config
let isFirebaseConfigured = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.join(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized with Service Account.");
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized with Project ID.");
  } else {
    console.warn("FIREBASE_PROJECT_ID not set. Firebase Admin Auth functionality will be disabled.");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

module.exports = { admin, isFirebaseConfigured };
