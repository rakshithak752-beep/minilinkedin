import { apiCall } from './api.js';

let currentUser = null;
let profileUserId = null;

// Wait for global user
const localUserRaw = localStorage.getItem('mini_linkedin_user');
if (localUserRaw) {
  currentUser = JSON.parse(localUserRaw);
  
  // Check if viewing someone else's profile via query param `?id=...`
  const urlParams = new URLSearchParams(window.location.search);
  profileUserId = urlParams.get('id') || currentUser._id;
  
  loadProfileData();
}

async function loadProfileData() {
  try {
    const profile = await apiCall(`/users/${profileUserId}`);
    
    document.getElementById('profile-name').innerText = profile.name;
    document.getElementById('profile-headline').innerText = profile.headline || "Ready to connect";
    document.getElementById('profile-location').innerText = profile.location || "Location not specified";
    document.getElementById('profile-bio').innerText = profile.bio || "No bio available.";
    
    const pic = profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`;
    document.getElementById('profile-picture').src = pic;

    // Render skills
    const skillsContainer = document.getElementById('profile-skills');
    if (profile.skills && profile.skills.length > 0) {
      skillsContainer.innerHTML = profile.skills.map(s => 
        `<span class="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md font-medium">${s}</span>`
      ).join('');
    }

    // Show Edit button ONLY if this is my profile
    if (profileUserId === currentUser._id) {
      document.getElementById('edit-profile-btn').classList.remove('hidden');
    }

  } catch (err) {
    console.error(err);
    document.getElementById('profile-name').innerText = "User Not Found";
  }
}
