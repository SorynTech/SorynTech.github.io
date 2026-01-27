// Environment Configuration
// These will be replaced by your actual environment variables
const CONFIG = {
    SORYN_USER: window.ENV?.SORYN_USER || "soryn",
    SORYN_PASS: window.ENV?.SORYN_PASS || "ratking123",
    GUEST_USER: window.ENV?.GUEST_USER || "guest",
    GUEST_PASS: window.ENV?.GUEST_PASS || "cheese456"
};

// Storage keys
const STORAGE_KEYS = {
    gallery: 'ratGallery',
    bots: 'ratBots',
    profile: 'ratProfile',
    currentUser: 'currentUser',
    userRole: 'userRole'
};

// Current user state
let currentUser = {
    username: null,
    role: 'guest', // 'owner' or 'guest'
    isLoggedIn: false
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initRatCursor();
    initNavigation();
    initAuth();
    initProfileEditing();
    initBotsSection();
    initGallery();
    loadFromStorage();
    checkAuthState();
});

// Rat Cursor
function initRatCursor() {
    const ratCursor = document.getElementById('ratCursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        ratCursor.style.left = cursorX + 'px';
        ratCursor.style.top = cursorY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Authentication
function initAuth() {
    const userBadge = document.getElementById('userBadge');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');

    userBadge.addEventListener('click', () => {
        if (currentUser.isLoggedIn) {
            if (confirm('Logout?')) {
                logout();
            }
        } else {
            loginModal.classList.add('active');
        }
    });

    closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });

    // Add Enter key support for login
    document.getElementById('loginUsername').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('loginPassword').focus();
    });

    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

function attemptLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginModal = document.getElementById('loginModal');

    if (username === CONFIG.SORYN_USER && password === CONFIG.SORYN_PASS) {
        login('owner', CONFIG.SORYN_USER);
        loginModal.classList.remove('active');
    } else if (username === CONFIG.GUEST_USER && password === CONFIG.GUEST_PASS) {
        login('guest', CONFIG.GUEST_USER);
        loginModal.classList.remove('active');
    } else {
        alert('❌ Invalid credentials! Try again, rat.');
        document.getElementById('loginPassword').value = '';
    }
}

function login(role, username) {
    currentUser = {
        username: username,
        role: role,
        isLoggedIn: true
    };

    sessionStorage.setItem(STORAGE_KEYS.currentUser, username);
    sessionStorage.setItem(STORAGE_KEYS.userRole, role);

    updateUIForRole();
    
    // Auto-unlock gallery for logged-in users
    unlockGallery();
}

function logout() {
    currentUser = {
        username: null,
        role: 'guest',
        isLoggedIn: false
    };

    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
    sessionStorage.removeItem(STORAGE_KEYS.userRole);

    updateUIForRole();
    location.reload(); // Refresh to reset state
}

function checkAuthState() {
    const savedUser = sessionStorage.getItem(STORAGE_KEYS.currentUser);
    const savedRole = sessionStorage.getItem(STORAGE_KEYS.userRole);

    if (savedUser && savedRole) {
        currentUser = {
            username: savedUser,
            role: savedRole,
            isLoggedIn: true
        };
        updateUIForRole();
        
        // Auto-unlock gallery
        const passwordOverlay = document.getElementById('passwordOverlay');
        if (passwordOverlay) {
            unlockGallery();
        }
    }
}

function updateUIForRole() {
    const userBadge = document.getElementById('userBadge');
    const badgeIcon = userBadge.querySelector('.badge-icon');
    const badgeText = userBadge.querySelector('.badge-text');

    if (currentUser.isLoggedIn) {
        badgeIcon.textContent = currentUser.role === 'owner' ? '👑' : '🐀';
        badgeText.textContent = currentUser.username;
        userBadge.title = 'Click to logout';
    } else {
        badgeIcon.textContent = '🔒';
        badgeText.textContent = 'Login';
        userBadge.title = 'Click to login';
    }

    // Enable/disable owner-only elements
    const ownerOnlyElements = document.querySelectorAll('.owner-only');
    ownerOnlyElements.forEach(el => {
        if (currentUser.role === 'owner') {
            el.classList.add('enabled');
            el.style.display = '';
        } else {
            el.classList.remove('enabled');
            if (el.tagName === 'BUTTON') {
                el.style.display = 'none';
            }
        }
    });
}

// Gallery Password Protection
function initGallery() {
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const unlockBtn = document.getElementById('unlockBtn');
    const artUsername = document.getElementById('artUsername');
    const artPassword = document.getElementById('artPassword');

    if (uploadBtn) uploadBtn.addEventListener('click', () => imageUpload.click());
    if (imageUpload) imageUpload.addEventListener('change', handleGalleryUpload);
    if (clearGalleryBtn) clearGalleryBtn.addEventListener('click', clearGallery);
    if (unlockBtn) unlockBtn.addEventListener('click', checkGalleryPassword);

    // Enter key support
    if (artUsername) {
        artUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') artPassword.focus();
        });
    }
    if (artPassword) {
        artPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkGalleryPassword();
        });
    }
}

function checkGalleryPassword() {
    const username = document.getElementById('artUsername').value;
    const password = document.getElementById('artPassword').value;

    if ((username === CONFIG.SORYN_USER && password === CONFIG.SORYN_PASS) ||
        (username === CONFIG.GUEST_USER && password === CONFIG.GUEST_PASS)) {
        unlockGallery();
    } else {
        alert('❌ Access denied! Wrong credentials, rat.');
        document.getElementById('artPassword').value = '';
    }
}

function unlockGallery() {
    const passwordOverlay = document.getElementById('passwordOverlay');
    const galleryContent = document.querySelector('.gallery-content');
    
    if (passwordOverlay) passwordOverlay.classList.add('unlocked');
    if (galleryContent) galleryContent.classList.add('unlocked');
}

function handleGalleryUpload(e) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can upload art!');
        return;
    }

    const files = Array.from(e.target.files);
    const gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.gallery) || '[]');

    let processed = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            gallery.push({
                src: event.target.result,
                timestamp: Date.now()
            });
            processed++;
            if (processed === files.length) {
                localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
                renderGallery();
            }
        };
        reader.readAsDataURL(file);
    });

    e.target.value = '';
}

function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.gallery) || '[]');

    if (gallery.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>The rat's collection awaits...</p>
            </div>
        `;
        return;
    }

    const deleteButton = currentUser.role === 'owner' 
        ? '<button class="delete-btn" onclick="deleteImage(INDEX)">×</button>'
        : '';

    galleryGrid.innerHTML = gallery.map((item, index) => `
        <div class="gallery-item">
            <img src="${item.src}" alt="Art ${index + 1}">
            ${deleteButton.replace('INDEX', index)}
        </div>
    `).join('');
}

function deleteImage(index) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can delete art!');
        return;
    }

    const gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.gallery) || '[]');
    gallery.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
    renderGallery();
}

function clearGallery() {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can clear the gallery!');
        return;
    }

    if (confirm('🐀 Delete all artwork? This cannot be undone!')) {
        localStorage.removeItem(STORAGE_KEYS.gallery);
        renderGallery();
    }
}

// Profile Editing
function initProfileEditing() {
    const lanyardName = document.getElementById('lanyardName');
    const lanyardRole = document.getElementById('lanyardRole');
    const lanyardImage = document.getElementById('lanyardImage');

    if (lanyardName) {
        lanyardName.addEventListener('click', () => {
            if (currentUser.role === 'owner') openEditModal('name');
        });
    }

    if (lanyardRole) {
        lanyardRole.addEventListener('click', () => {
            if (currentUser.role === 'owner') openEditModal('role');
        });
    }

    if (lanyardImage) {
        lanyardImage.addEventListener('click', () => {
            if (currentUser.role === 'owner') openEditModal('image');
        });
    }

    // Social links editing
    ['twitter', 'instagram', 'github', 'discord'].forEach(platform => {
        const link = document.getElementById(`${platform}Link`);
        if (link) {
            link.addEventListener('contextmenu', (e) => {
                if (currentUser.role === 'owner') {
                    e.preventDefault();
                    openEditModal('social', platform);
                }
            });
        }
    });
}

function openEditModal(type, platform = null) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can edit this!');
        return;
    }

    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.classList.add('active');

    switch(type) {
        case 'name':
            modalTitle.textContent = '✏️ Edit Name';
            modalBody.innerHTML = `
                <label>Display Name</label>
                <input type="text" id="editInput" value="${document.getElementById('lanyardName').textContent}">
                <button onclick="saveEdit('name')">Save 🐀</button>
            `;
            break;
        case 'role':
            modalTitle.textContent = '✏️ Edit Role';
            modalBody.innerHTML = `
                <label>Your Role/Title</label>
                <input type="text" id="editInput" value="${document.getElementById('lanyardRole').textContent}">
                <button onclick="saveEdit('role')">Save 🐀</button>
            `;
            break;
        case 'image':
            modalTitle.textContent = '✏️ Change Profile Picture';
            modalBody.innerHTML = `
                <label>Image URL or Upload</label>
                <input type="text" id="editInput" placeholder="Enter image URL">
                <p style="text-align: center; margin: 1rem 0; color: var(--text-muted);">or</p>
                <input type="file" id="imageFileInput" accept="image/*" style="margin-bottom: 1rem;">
                <button onclick="saveEdit('image')">Save 🐀</button>
            `;
            document.getElementById('imageFileInput').addEventListener('change', handleImageUpload);
            break;
        case 'social':
            modalTitle.textContent = `✏️ Edit ${platform.charAt(0).toUpperCase() + platform.slice(1)} Link`;
            const currentUrl = document.getElementById(`${platform}Link`).getAttribute('href');
            modalBody.innerHTML = `
                <label>Profile URL</label>
                <input type="text" id="editInput" value="${currentUrl}" placeholder="https://">
                <button onclick="saveEdit('social', '${platform}')">Save 🐀</button>
            `;
            break;
    }

    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('editInput').value = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveEdit(type, platform = null) {
    const input = document.getElementById('editInput').value;
    const modal = document.getElementById('editModal');

    switch(type) {
        case 'name':
            document.getElementById('lanyardName').textContent = input;
            break;
        case 'role':
            document.getElementById('lanyardRole').textContent = input;
            break;
        case 'image':
            document.getElementById('lanyardImage').src = input;
            break;
        case 'social':
            document.getElementById(`${platform}Link`).setAttribute('href', input);
            break;
    }

    modal.classList.remove('active');
    saveToStorage();
}

// Bots Section
function initBotsSection() {
    const addBotBtn = document.getElementById('addBotBtn');
    if (addBotBtn) {
        addBotBtn.addEventListener('click', () => {
            if (currentUser.role === 'owner') {
                openBotModal();
            }
        });
    }
}

function openBotModal(botData = null, index = null) {
    if (currentUser.role !== 'owner' && botData) {
        return; // Guests can't edit
    }

    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.classList.add('active');
    modalTitle.textContent = botData ? '✏️ Edit Bot' : '🐀 Add Discord Bot';

    const bot = botData || {
        icon: '🤖',
        name: '',
        description: '',
        servers: '',
        users: '',
        inviteLink: ''
    };

    modalBody.innerHTML = `
        <label>Bot Icon (emoji)</label>
        <input type="text" id="botIcon" value="${bot.icon}" placeholder="🤖">
        
        <label>Bot Name</label>
        <input type="text" id="botName" value="${bot.name}" placeholder="My Awesome Bot">
        
        <label>Description</label>
        <textarea id="botDescription" rows="3" placeholder="What does your bot do?">${bot.description}</textarea>
        
        <label>Servers Count</label>
        <input type="text" id="botServers" value="${bot.servers}" placeholder="1.2K">
        
        <label>Users Count</label>
        <input type="text" id="botUsers" value="${bot.users}" placeholder="50K">
        
        <label>Invite Link</label>
        <input type="text" id="botInviteLink" value="${bot.inviteLink}" placeholder="https://discord.com/invite/...">
        
        <button onclick="saveBot(${index})">Save Bot 🐀</button>
        ${botData ? `<button onclick="deleteBot(${index})" style="background: var(--accent-secondary); margin-top: 0.5rem;">Delete Bot 🗑️</button>` : ''}
    `;

    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

function saveBot(index = null) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can save bots!');
        return;
    }

    const botData = {
        icon: document.getElementById('botIcon').value,
        name: document.getElementById('botName').value,
        description: document.getElementById('botDescription').value,
        servers: document.getElementById('botServers').value,
        users: document.getElementById('botUsers').value,
        inviteLink: document.getElementById('botInviteLink').value
    };

    let bots = JSON.parse(localStorage.getItem(STORAGE_KEYS.bots) || '[]');
    
    if (index !== null) {
        bots[index] = botData;
    } else {
        bots.push(botData);
    }

    localStorage.setItem(STORAGE_KEYS.bots, JSON.stringify(bots));
    renderBots();
    document.getElementById('editModal').classList.remove('active');
}

function deleteBot(index) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can delete bots!');
        return;
    }

    if (confirm('🐀 Delete this bot?')) {
        let bots = JSON.parse(localStorage.getItem(STORAGE_KEYS.bots) || '[]');
        bots.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.bots, JSON.stringify(bots));
        renderBots();
        document.getElementById('editModal').classList.remove('active');
    }
}

function renderBots() {
    const botsGrid = document.getElementById('botsGrid');
    const bots = JSON.parse(localStorage.getItem(STORAGE_KEYS.bots) || '[]');

    if (bots.length === 0) {
        botsGrid.innerHTML = `
            <div class="bot-card">
                <div class="bot-icon">🤖</div>
                <h3 class="bot-name">Example Bot</h3>
                <p class="bot-description">A helpful Discord bot that does amazing things. Login as owner to customize!</p>
                <div class="bot-stats">
                    <span class="stat"><strong>1.2K</strong> Servers</span>
                    <span class="stat"><strong>50K</strong> Users</span>
                </div>
                <a href="#" class="bot-link">Invite Bot →</a>
            </div>
        `;
        return;
    }

    const isOwner = currentUser.role === 'owner';
    botsGrid.innerHTML = bots.map((bot, index) => `
        <div class="bot-card" ${isOwner ? `onclick="openBotModal(${JSON.stringify(bot).replace(/"/g, '&quot;')}, ${index})"` : ''} style="${isOwner ? 'cursor: pointer;' : ''}">
            <div class="bot-icon">${bot.icon}</div>
            <h3 class="bot-name">${bot.name}</h3>
            <p class="bot-description">${bot.description}</p>
            <div class="bot-stats">
                <span class="stat"><strong>${bot.servers}</strong> Servers</span>
                <span class="stat"><strong>${bot.users}</strong> Users</span>
            </div>
            <a href="${bot.inviteLink}" class="bot-link" onclick="event.stopPropagation()" target="_blank">Invite Bot →</a>
        </div>
    `).join('');
}

// Storage Management
function saveToStorage() {
    const profileData = {
        name: document.getElementById('lanyardName').textContent,
        role: document.getElementById('lanyardRole').textContent,
        image: document.getElementById('lanyardImage').src,
        socials: {
            twitter: document.getElementById('twitterLink').getAttribute('href'),
            instagram: document.getElementById('instagramLink').getAttribute('href'),
            github: document.getElementById('githubLink').getAttribute('href'),
            discord: document.getElementById('discordLink').getAttribute('href')
        }
    };

    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profileData));
}

function loadFromStorage() {
    // Load profile data
    const profileData = JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || 'null');
    if (profileData) {
        document.getElementById('lanyardName').textContent = profileData.name;
        document.getElementById('lanyardRole').textContent = profileData.role;
        if (profileData.image && !profileData.image.includes('profile.jpg')) {
            document.getElementById('lanyardImage').src = profileData.image;
        }
        Object.keys(profileData.socials).forEach(platform => {
            document.getElementById(`${platform}Link`).setAttribute('href', profileData.socials[platform]);
        });
    }

    // Load bots
    renderBots();

    // Load gallery
    renderGallery();
}

// Make functions globally accessible
window.attemptLogin = attemptLogin;
window.saveEdit = saveEdit;
window.saveBot = saveBot;
window.deleteBot = deleteBot;
window.deleteImage = deleteImage;
window.openBotModal = openBotModal;
