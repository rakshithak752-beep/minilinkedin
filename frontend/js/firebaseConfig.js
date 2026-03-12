import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

// Your web app's Firebase configuration
// User needs to replace this with their actual config or use a mock logic for local test
const firebaseConfig = {
  apiKey: "AIzaSyA_hjxyv3kZvl1cF88NyL5HkgixbkBQmt4",
  authDomain: "minilinkedin-67d81.firebaseapp.com",
  projectId: "minilinkedin-67d81",
  storageBucket: "minilinkedin-67d81.firebasestorage.app",
  messagingSenderId: "603822775479",
  appId: "1:603822775479:web:c4624335098e4cadb88132",
  measurementId: "G-JJPYVQ4RJ1"
};

// Initialize Firebase
let app, auth, analytics;
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Using placeholder API key. Mock Auth mode enabled.");
  auth = null;
  analytics = null;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase config error:", error);
    auth = null;
    analytics = null;
  }
}

export { auth, analytics };
