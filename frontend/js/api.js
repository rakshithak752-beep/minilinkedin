import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to get the current Firebase user, waiting for initialization if necessary.
 */
function getCurrentUser() {
  return new Promise((resolve) => {
    if (!auth) return resolve(null); // Mock mode
    
    // Check if auth is already initialized
    if (auth.currentUser !== null) {
      return resolve(auth.currentUser);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Universal fetch wrapper that attaches the Firebase auth token.
 */
export async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
  let token = null;

  const user = await getCurrentUser();
  if (user) {
    try {
      token = await user.getIdToken();
    } catch (e) {
      console.error("Error getting token", e);
    }
  }

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If we are passing FormData (e.g., for image uploads), do NOT set Content-Type header manually.
  // The browser will set it to multipart/form-data with the correct boundary automatically.
  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Attempt to parse JSON response.
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }

    return data;
  } catch (error) {
    console.error(`API Call failed for ${endpoint}:`, error);
    throw error;
  }
}
