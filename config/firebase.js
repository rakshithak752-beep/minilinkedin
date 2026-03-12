const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin based on config
let isFirebaseConfigured = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // For platforms like Render/Heroku, read the JSON from an environment variable string
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized with Service Account JSON string.");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Local development fallback using the file path
    const serviceAccountPath = path.join(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized with Service Account File.");
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized with Project ID.");
  } else {
    console.warn("FIREBASE_PROJECT_ID or Service Account config not set. Firebase Admin Auth functionality will be disabled.");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

module.exports = { admin, isFirebaseConfigured };
