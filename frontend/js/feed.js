import { apiCall } from './api.js';

let currentUser = null;

// DOM Elements
const sidebarName = document.getElementById('sidebar-name');
const sidebarHeadline = document.getElementById('sidebar-headline');
const sidebarProfileImg = document.getElementById('sidebar-profile-img');
const navProfileImg = document.getElementById('nav-profile-img');
const createPostImg = document.getElementById('create-post-img');

const postsContainer = document.getElementById('posts-container');
const postCaption = document.getElementById('post-caption');
const postImageInput = document.getElementById('post-image');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');
const submitPostBtn = document.getElementById('submit-post-btn');
const enhanceBtn = document.getElementById('enhance-btn');

const notifBell = document.getElementById('notif-bell');
const notifDropdown = document.getElementById('notif-dropdown');
const notifList = document.getElementById('notif-list');
const notifBadge = document.getElementById('notif-badge');
const profileMenuBtn = document.getElementById('profile-menu-btn');
const profileDropdown = document.getElementById('profile-dropdown');

// Wait for global user to be populated or fetch from local storage temporarily
const localUserRaw = localStorage.getItem('mini_linkedin_user');
if (localUserRaw) {
  currentUser = JSON.parse(localUserRaw);
  populateMyInfo();
  loadPosts();
  loadNotifications();
}

/**
 * Update UI with current user info
 */
function populateMyInfo() {
  if (!currentUser) return;
  const name = currentUser.name || "User";
  const pic = currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  const headline = currentUser.headline || "Ready to connect";

  sidebarName.innerText = name;
  sidebarHeadline.innerText = headline;
  sidebarProfileImg.src = pic;
  navProfileImg.src = pic;
  createPostImg.src = pic;
}

/**
 * Dropdowns logic
 */
notifBell.addEventListener('click', () => {
  notifDropdown.classList.toggle('hidden');
  profileDropdown.classList.add('hidden');
});
profileMenuBtn.addEventListener('click', () => {
  profileDropdown.classList.toggle('hidden');
  notifDropdown.classList.add('hidden');
});
document.addEventListener('click', (e) => {
  if (!notifBell.contains(e.target) && !notifDropdown.contains(e.target)) notifDropdown.classList.add('hidden');
  if (!profileMenuBtn.contains(e.target) && !profileDropdown.contains(e.target)) profileDropdown.classList.add('hidden');
});

/**
 * AI Enhance Caption
 */
enhanceBtn.addEventListener('click', async () => {
  const text = postCaption.value.trim();
  if (!text) return alert('Type a caption first!');
  
  try {
    enhanceBtn.innerHTML = '<div class="spinner border-purple-500 w-4 h-4"></div>';
    enhanceBtn.disabled = true;
    
    const res = await apiCall('/ai/enhance-caption', 'POST', { captionText: text });
    postCaption.value = res.enhancedText;
    checkPostValidity();
  } catch (err) {
    alert('AI Enhancement failed: ' + err.message);
  } finally {
    enhanceBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><span class="text-sm font-medium hidden sm:inline">Enhance Caption</span>';
    enhanceBtn.disabled = false;
  }
});

/**
 * Post Creation Logic
 */
let selectedFile = null;

postCaption.addEventListener('input', checkPostValidity);

postImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imagePreview.src = ev.target.result;
      imagePreviewContainer.classList.remove('hidden');
      checkPostValidity();
    };
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener('click', () => {
  selectedFile = null;
  postImageInput.value = '';
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
  checkPostValidity();
});

function checkPostValidity() {
  submitPostBtn.disabled = postCaption.value.trim() === '' && !selectedFile;
}

submitPostBtn.addEventListener('click', async () => {
  try {
    submitPostBtn.disabled = true;
    submitPostBtn.innerText = 'Posting...';
    
    let formData = new FormData();
    formData.append('caption', postCaption.value.trim());
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    await apiCall('/posts', 'POST', formData, true);
    
    // reset form
    postCaption.value = '';
    removeImageBtn.click();
    
    // reload posts
    await loadPosts();
  } catch (err) {
    alert('Failed to create post');
  } finally {
    submitPostBtn.innerText = 'Post';
    checkPostValidity();
  }
});

/**
 * Load and Render Posts
 */
async function loadPosts() {
  try {
    const posts = await apiCall('/posts');
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
      postsContainer.innerHTML = '<div class="text-center p-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">No posts yet. Be the first to post!</div>';
      return;
    }

    posts.forEach(post => {
      postsContainer.appendChild(createPostElement(post));
    });
  } catch (err) {
    postsContainer.innerHTML = '<div class="text-center p-8 text-red-500 bg-white rounded-lg shadow-sm border border-gray-200">Failed to load posts</div>';
  }
}

function createPostElement(post) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
  
  const hasLiked = currentUser && post.likes.includes(currentUser._id);
  const likesCount = post.likes.length;
  
  const authorPic = post.authorId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorId?.name || 'User')}`;
  
  let skillsHtml = '';
  if (post.detectedSkills && post.detectedSkills.length > 0) {
    skillsHtml = `<div class="mt-2 flex gap-1 flex-wrap">` + 
      post.detectedSkills.map(s => `<span class="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded font-medium">${s}</span>`).join('') +
      `</div>`;
  }

  let imgHtml = '';
  if (post.imageUrl) {
    imgHtml = `<img src="${post.imageUrl}" class="w-full object-cover max-h-96 mt-3 border-t border-gray-100" loading="lazy">`;
  }

  div.innerHTML = `
    <div class="p-4 pb-2">
      <div class="flex items-start gap-3">
        <a href="profile.html?id=${post.authorId?._id}" class="shrink-0">
          <img src="${authorPic}" class="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-primary transition">
        </a>
        <div>
          <a href="profile.html?id=${post.authorId?._id}" class="font-semibold text-textDark hover:text-primary hover:underline">${post.authorId?.name}</a>
          <p class="text-xs text-textMuted">${post.authorId?.headline || 'Member'}</p>
          <p class="text-[11px] text-gray-400 flex items-center gap-1">${new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div class="mt-3 text-sm text-gray-800 leading-relaxed whitespace-pre-line">${post.caption}</div>
      ${skillsHtml}
    </div>
    ${imgHtml}
    <div class="px-4 py-2 border-t border-gray-100 flex items-center gap-1 text-sm text-textMuted">
      <span id="likes-count-${post._id}">${likesCount}</span> Likes &bull; ${post.comments?.length || 0} Comments
    </div>
    <div class="px-2 py-1 border-t border-gray-100 flex pb-2 gap-1">
      <button onclick="window.likePost('${post._id}')" id="like-btn-${post._id}" class="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 transition ${hasLiked ? 'text-primary' : 'text-textMuted font-medium'}">
        <svg class="w-5 h-5" fill="${hasLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
        Like
      </button>
      <button onclick="window.toggleComments('${post._id}')" class="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 transition text-textMuted font-medium">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        Comment
      </button>
    </div>
    <!-- Comments Section -->
    <div id="comments-section-${post._id}" class="hidden px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div class="flex gap-2 mb-4">
        <img src="${navProfileImg.src}" class="w-8 h-8 rounded-full">
        <div class="flex-1 flex gap-2">
          <input type="text" id="comment-input-${post._id}" placeholder="Add a comment..." class="flex-1 border border-gray-300 rounded-full px-4 text-sm focus:outline-none focus:border-gray-400">
          <button onclick="window.submitComment('${post._id}')" class="text-primary font-medium px-2 hover:bg-blue-50 rounded-full transition text-sm">Post</button>
        </div>
      </div>
      <div id="comments-list-${post._id}" class="space-y-3">
        ${renderComments(post.comments)}
      </div>
    </div>
  `;
  return div;
}

function renderComments(comments) {
  if (!comments || comments.length === 0) return '<div class="text-xs text-gray-500 ml-10">No comments yet.</div>';
  return comments.map(c => `
    <div class="flex gap-2 text-sm">
      <img src="${c.userId?.profilePicture || 'https://ui-avatars.com/api/?name=U'}" class="w-8 h-8 rounded-full">
      <div class="bg-gray-200 rounded-lg px-3 py-2 flex-1 rounded-tl-none">
        <span class="font-semibold text-textDark block">${c.userId?.name}</span>
        <span class="text-gray-800">${c.commentText}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Handle Likes visually immediately, then sync
 */
window.likePost = async (postId) => {
  const btn = document.getElementById(`like-btn-${postId}`);
  const isLiked = btn.classList.contains('text-primary');
  const countEl = document.getElementById(`likes-count-${postId}`);
  let count = parseInt(countEl.innerText);

  if (isLiked) {
    btn.classList.remove('text-primary');
    btn.classList.add('text-textMuted', 'font-medium');
    btn.querySelector('svg').setAttribute('fill', 'none');
    countEl.innerText = count - 1;
  } else {
    btn.classList.add('text-primary');
    btn.classList.remove('text-textMuted', 'font-medium');
    btn.querySelector('svg').setAttribute('fill', 'currentColor');
    countEl.innerText = count + 1;
  }

  try {
    const data = await apiCall(`/posts/${postId}/like`, 'POST');
    // If exact count from server differs slightly due to concurrent likes, update it
    countEl.innerText = data.likes.length;
  } catch (err) {
    console.error('Like error', err);
  }
};

window.toggleComments = (postId) => {
  const sec = document.getElementById(`comments-section-${postId}`);
  sec.classList.toggle('hidden');
};

window.submitComment = async (postId) => {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if (!text) return;

  try {
    input.disabled = true;
    const newComment = await apiCall(`/posts/${postId}/comment`, 'POST', { commentText: text });
    
    // Add dynamically
    const list = document.getElementById(`comments-list-${postId}`);
    if (list.innerHTML.includes('No comments yet')) list.innerHTML = '';
    
    const div = document.createElement('div');
    div.className = 'flex gap-2 text-sm mb-3';
    div.innerHTML = `
      <img src="${navProfileImg.src}" class="w-8 h-8 rounded-full">
      <div class="bg-gray-200 rounded-lg px-3 py-2 flex-1 rounded-tl-none shadow-sm">
        <span class="font-semibold text-textDark block">${currentUser.name}</span>
        <span class="text-gray-800">${newComment.commentText}</span>
      </div>
    `;
    list.prepend(div);
    input.value = '';
  } catch (err) {
    console.error(err);
  } finally {
    input.disabled = false;
  }
};

/**
 * Notifications Logic
 */
async function loadNotifications() {
  try {
    const notifs = await apiCall('/notifications');
    const unread = notifs.filter(n => !n.read);
    
    if (unread.length > 0) {
      notifBadge.classList.remove('hidden');
    }

    if (notifs.length > 0) {
      notifList.innerHTML = notifs.map(n => `
        <div class="px-4 py-3 hover:bg-gray-50 border-b cursor-pointer flex gap-3 text-sm ${!n.read ? 'bg-blue-50 border-l-4 border-l-primary' : ''}" onclick="window.readNotif('${n._id}')">
          <img src="${n.relatedUser?.profilePicture || 'https://ui-avatars.com/api/?name=AI'}" class="w-10 h-10 rounded-full shrink-0">
          <div>
            <p class="text-textDark ${!n.read ? 'font-medium' : ''}">${n.message}</p>
            <p class="text-xs text-textMuted mt-1">${new Date(n.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

window.readNotif = async (id) => {
  try {
    await apiCall(`/notifications/${id}/read`, 'PUT');
    loadNotifications();
  } catch (e) {
    console.error(e);
  }
};
