import { auth } from './firebaseConfig.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { apiCall } from './api.js';

// Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-msg');
const logoutBtn = document.getElementById('logout-btn'); // For feed/profile pages

// Handle Sign Up
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submit-btn');
    
    try {
      btn.disabled = true;
      btn.innerText = 'Joining...';
      errorMsg.classList.add('hidden');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update Firebase Profile
      await updateProfile(userCredential.user, { displayName: name });
      
      // Let onAuthStateChanged handle the redirect to feed
    } catch (error) {
      errorMsg.innerText = error.message;
      errorMsg.classList.remove('hidden');
      btn.disabled = false;
      btn.innerText = 'Agree & Join';
    }
  });
}

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submit-btn');
    
    try {
      btn.disabled = true;
      btn.innerText = 'Signing in...';
      errorMsg.classList.add('hidden');
      
      await signInWithEmailAndPassword(auth, email, password);
      // Let onAuthStateChanged handle the redirect to feed
    } catch (error) {
      errorMsg.innerText = 'Invalid email or password.';
      errorMsg.classList.remove('hidden');
      btn.disabled = false;
      btn.innerText = 'Sign in';
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('mini_linkedin_user');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}

// Manage Auth State Globally
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
    
    if (user) {
      // User is logged in
      try {
        // Sync with our backend to ensure Mongo record exists
        const res = await apiCall('/users/sync', 'POST', { name: user.displayName, profilePicture: user.photoURL });
        localStorage.setItem('mini_linkedin_user', JSON.stringify(res));
        
        // If on login/signup page, redirect to feed
        if (isAuthPage) {
          window.location.href = 'feed.html';
        }
      } catch (err) {
        console.error('Error syncing user', err);
      }
    } else {
      // User is logged out
      localStorage.removeItem('mini_linkedin_user');
      if (!isAuthPage) {
        window.location.href = 'login.html';
      }
    }
  });
} else {
  // MOCK LOGIC FOR LOCAL TESTING WITHOUT FIREBASE CONFIG
  console.warn("Using mock auth logic.");
  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
  
  const mockLogin = async () => {
    const mockUser = { _id: "64a0f8b9e4b0a1d4b8e2d1d2", name: "Mock User", email: "mock@example.com", skills: ["JavaScript", "HTML"] };
    localStorage.setItem('mini_linkedin_user', JSON.stringify(mockUser));
    // Simulate token in apiCall by ignoring auth check if token absent
    window.location.href = 'feed.html';
  };

  if (loginForm) loginForm.addEventListener('submit', (e) => { e.preventDefault(); mockLogin(); });
  if (signupForm) signupForm.addEventListener('submit', (e) => { e.preventDefault(); mockLogin(); });
  
  if (!isAuthPage && !localStorage.getItem('mini_linkedin_user')) {
    window.location.href = 'login.html';
  } else if (isAuthPage && localStorage.getItem('mini_linkedin_user')) {
    window.location.href = 'feed.html';
  }
}
