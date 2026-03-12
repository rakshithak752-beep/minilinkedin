import { apiCall } from './api.js';

let currentUser = null;

const editForm = document.getElementById('edit-profile-form');
const nameInput = document.getElementById('name');
const profilePictureInput = document.getElementById('profilePicture');
const headlineInput = document.getElementById('headline');
const locationInput = document.getElementById('location');
const bioInput = document.getElementById('bio');
const skillsInput = document.getElementById('skills');

const enhanceBioBtn = document.getElementById('enhance-bio-btn');
const saveBtn = document.getElementById('save-btn');

// Load Current Data
const localUserRaw = localStorage.getItem('mini_linkedin_user');
if (localUserRaw) {
  currentUser = JSON.parse(localUserRaw);
  loadForm();
} else {
  window.location.href = 'login.html';
}

async function loadForm() {
  try {
    // Fetch fresh to ensure we have bio/skills since login sync might not return all nested fields if large 
    const profile = await apiCall(`/users/${currentUser._id}`);
    
    nameInput.value = profile.name || '';
    profilePictureInput.value = profile.profilePicture || '';
    headlineInput.value = profile.headline || '';
    locationInput.value = profile.location || '';
    bioInput.value = profile.bio || '';
    skillsInput.value = profile.skills?.join(', ') || '';
    
  } catch (err) {
    console.error(err);
  }
}

// Enhance Bio
enhanceBioBtn.addEventListener('click', async () => {
  const text = bioInput.value.trim();
  if (!text) return alert('Please write a rough draft of your bio first!');
  
  try {
    enhanceBioBtn.innerHTML = '<div class="spinner border-purple-500 w-3 h-3"></div> Enhancing...';
    enhanceBioBtn.disabled = true;
    
    const res = await apiCall('/ai/enhance-bio', 'POST', { bioText: text });
    bioInput.value = res.enhancedText;
  } catch (err) {
    alert('AI Enhancement failed: ' + err.message);
  } finally {
    enhanceBioBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> AI Enhance';
    enhanceBioBtn.disabled = false;
  }
});

// Save changes
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';
    
    const body = {
      name: nameInput.value.trim(),
      profilePicture: profilePictureInput.value.trim(),
      headline: headlineInput.value.trim(),
      location: locationInput.value.trim(),
      bio: bioInput.value.trim(),
      skills: skillsInput.value.trim()
    };
    
    await apiCall('/users/profile', 'PUT', body);
    
    // Redirect to profile
    window.location.href = 'profile.html';
  } catch (err) {
    alert('Failed to save profile: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerText = 'Save';
  }
});
