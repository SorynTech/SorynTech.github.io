// Environment Configuration - Hide from console
const CONFIG = (() => {
    const config = {
        SORYN_USER: window.ENV?.SORYN_USER || "soryn",
        SORYN_PASS: window.ENV?.SORYN_PASS || "ratking123",
        GUEST_USER: window.ENV?.GUEST_USER || "guest",
        GUEST_PASS: window.ENV?.GUEST_PASS || "cheese456"
    };
    
    if (window.ENV) {
        delete window.ENV;
    }
    
    return Object.freeze(config);
})();

// GitHub-based storage paths
const GITHUB_PATHS = {
    bots: './data/bots.json',
    profile: './data/profile.json',
    galleryManifest: './data/gallery.json',
    imagesFolder: './images/',
    botsFolder: './bots/'
};

// Fallback storage keys for offline mode
const STORAGE_KEYS = {
    currentUser: 'currentUser',
    userRole: 'userRole'
};

// Current user state
let currentUser = {
    username: null,
    role: 'guest',
    isLoggedIn: false
};

// Cache for loaded data
let dataCache = {
    bots: [],
    profile: null,
    gallery: []
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    initNavigation();
    initAuth();
    initProfileEditing();
    initBotsSection();
    initGallery();
    checkAuthState();
    
    // Load all data from GitHub
    await loadAllData();
});

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
    location.reload();
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
        unlockGallery();
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

// Data Loading Functions
async function loadAllData() {
    try {
        // Load bots data
        await loadBotsData();
        
        // Load profile data
        await loadProfileData();
        
        // Load gallery data
        await loadGalleryData();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('⚠️ Some data failed to load. Using defaults.', 'warning');
    }
}

async function loadBotsData() {
    try {
        const response = await fetch(GITHUB_PATHS.bots);
        if (response.ok) {
            const data = await response.json();
            dataCache.bots = data.bots || [];
            renderBots();
        } else {
            console.log('No bots.json found, using empty array');
            dataCache.bots = [];
            renderBots();
        }
    } catch (error) {
        console.error('Error loading bots:', error);
        dataCache.bots = [];
        renderBots();
    }
}

async function loadProfileData() {
    try {
        const response = await fetch(GITHUB_PATHS.profile);
        if (response.ok) {
            const data = await response.json();
            dataCache.profile = data;
            applyProfileData(data);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadGalleryData() {
    try {
        const response = await fetch(GITHUB_PATHS.galleryManifest);
        if (response.ok) {
            const data = await response.json();
            dataCache.gallery = data.images || [];
            renderGallery();
        } else {
            dataCache.gallery = [];
            renderGallery();
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        dataCache.gallery = [];
        renderGallery();
    }
}

function applyProfileData(data) {
    if (data.name) document.getElementById('lanyardName').textContent = data.name;
    if (data.role) document.getElementById('lanyardRole').textContent = data.role;
    if (data.image) document.getElementById('lanyardImage').src = data.image;
    
    if (data.socials) {
        if (data.socials.twitter) document.getElementById('twitterLink').setAttribute('href', data.socials.twitter);
        if (data.socials.instagram) document.getElementById('instagramLink').setAttribute('href', data.socials.instagram);
        if (data.socials.github) document.getElementById('githubLink').setAttribute('href', data.socials.github);
        if (data.socials.discord) document.getElementById('discordLink').setAttribute('href', data.socials.discord);
        if (data.socials.kofi) document.getElementById('kofiLink').setAttribute('href', data.socials.kofi);
    }
}

// Gallery Functions
function initGallery() {
    const uploadBtn = document.getElementById('uploadBtn');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const unlockBtn = document.getElementById('unlockBtn');
    const artUsername = document.getElementById('artUsername');
    const artPassword = document.getElementById('artPassword');

    if (uploadBtn) uploadBtn.addEventListener('click', showUploadInstructions);
    if (addUrlBtn) addUrlBtn.addEventListener('click', addImageToManifest);
    if (clearGalleryBtn) clearGalleryBtn.addEventListener('click', clearGallery);
    if (unlockBtn) unlockBtn.addEventListener('click', checkGalleryPassword);

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

function showUploadInstructions() {
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.classList.add('active');
    modalTitle.textContent = '📤 Upload Images to Gallery';
    
    modalBody.innerHTML = `
        <div style="text-align: left; line-height: 1.8;">
            <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">📁 Step-by-Step Upload Guide:</h4>
            
            <p><strong>1. Add images to your GitHub repository:</strong></p>
            <ul style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-secondary);">
                <li>Go to your repository on GitHub</li>
                <li>Create an <code>/images</code> folder if it doesn't exist</li>
                <li>Click "Add file" → "Upload files"</li>
                <li>Drag and drop your artwork images</li>
                <li>Commit the changes</li>
            </ul>
            
            <p><strong>2. Add image to gallery manifest:</strong></p>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                Click "Add Image URL" button and enter the relative path:
            </p>
            <code style="background: var(--bg-secondary); padding: 0.5rem; display: block; margin-bottom: 1rem; border-radius: 5px;">
                ./images/your-artwork.jpg
            </code>
            
            <p><strong>3. Supported formats:</strong></p>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                .jpg, .jpeg, .png, .gif, .webp
            </p>
            
            <div style="background: rgba(125, 211, 252, 0.1); padding: 1rem; border-radius: 10px; border-left: 4px solid var(--accent-primary);">
                <strong>💡 Pro Tip:</strong> Images in the <code>/images</code> folder are public and will load on any device/browser!
            </div>
        </div>
        <button onclick="document.getElementById('editModal').classList.remove('active')" style="margin-top: 1.5rem;">Got it! 🐀</button>
    `;

    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

function addImageToManifest() {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can add images!');
        return;
    }

    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.classList.add('active');
    modalTitle.textContent = '🖼️ Add Image to Gallery';
    
    modalBody.innerHTML = `
        <label>Image Path or URL</label>
        <input type="text" id="imagePathInput" placeholder="./images/artwork1.jpg" value="./images/">
        
        <div style="margin: 1rem 0; padding: 1rem; background: rgba(125, 211, 252, 0.1); border-radius: 10px;">
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                <strong>📁 For images in your repo:</strong><br>
                <code>./images/filename.jpg</code>
            </p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                <strong>🔗 For external URLs:</strong><br>
                <code>https://i.ibb.co/xxxxx/image.jpg</code>
            </p>
        </div>
        
        <label>Image Title (optional)</label>
        <input type="text" id="imageTitleInput" placeholder="My Artwork">
        
        <label>Image Description (optional)</label>
        <textarea id="imageDescInput" rows="2" placeholder="Description of the artwork"></textarea>
        
        <button onclick="saveImageToManifest()">Add to Gallery 🐀</button>
    `;

    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

function saveImageToManifest() {
    const path = document.getElementById('imagePathInput').value.trim();
    const title = document.getElementById('imageTitleInput').value.trim();
    const description = document.getElementById('imageDescInput').value.trim();
    
    if (!path) {
        alert('❌ Please enter an image path or URL!');
        return;
    }

    // Add to cache
    const newImage = {
        src: path,
        title: title || `Artwork ${dataCache.gallery.length + 1}`,
        description: description,
        timestamp: Date.now()
    };
    
    dataCache.gallery.push(newImage);
    renderGallery();
    
    document.getElementById('editModal').classList.remove('active');
    
    // Show instructions to update JSON
    showJsonUpdateInstructions('gallery', dataCache.gallery);
}

function showJsonUpdateInstructions(type, data) {
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    let jsonPath, jsonContent;
    
    if (type === 'gallery') {
        jsonPath = 'data/gallery.json';
        jsonContent = JSON.stringify({ images: data }, null, 2);
    } else if (type === 'bots') {
        jsonPath = 'data/bots.json';
        jsonContent = JSON.stringify({ bots: data }, null, 2);
    } else if (type === 'profile') {
        jsonPath = 'data/profile.json';
        jsonContent = JSON.stringify(data, null, 2);
    }

    modal.classList.add('active');
    modalTitle.textContent = '💾 Update JSON File';
    
    modalBody.innerHTML = `
        <div style="text-align: left;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                Copy this JSON and update <code>${jsonPath}</code> in your GitHub repo:
            </p>
            
            <div style="position: relative;">
                <textarea id="jsonOutput" readonly style="
                    width: 100%;
                    height: 300px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 1rem;
                    color: var(--text-primary);
                    resize: vertical;
                ">${jsonContent}</textarea>
                <button onclick="copyJsonToClipboard()" style="
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--accent-primary);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">📋 Copy JSON</button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 10px; border-left: 4px solid var(--purple-dark);">
                <h4 style="margin-bottom: 0.5rem; color: var(--accent-primary);">📝 How to Update:</h4>
                <ol style="margin-left: 1.5rem; color: var(--text-secondary); line-height: 1.8;">
                    <li>Copy the JSON above</li>
                    <li>Go to your GitHub repository</li>
                    <li>Navigate to <code>${jsonPath}</code></li>
                    <li>Click the pencil icon to edit</li>
                    <li>Paste the new JSON</li>
                    <li>Scroll down and click "Commit changes"</li>
                    <li>Wait 1-2 minutes, then refresh this page</li>
                </ol>
            </div>
        </div>
        <button onclick="document.getElementById('editModal').classList.remove('active')" style="margin-top: 1rem;">Close</button>
    `;

    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
}

function copyJsonToClipboard() {
    const textarea = document.getElementById('jsonOutput');
    textarea.select();
    document.execCommand('copy');
    
    showNotification('✅ JSON copied to clipboard!', 'success');
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

function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (dataCache.gallery.length === 0) {
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

    galleryGrid.innerHTML = dataCache.gallery.map((item, index) => `
        <div class="gallery-item loading" id="gallery-item-${index}">
            <img src="${item.src}" 
                 alt="${item.title || 'Art ' + (index + 1)}"
                 title="${item.description || item.title || ''}"
                 onload="handleImageLoad(${index})"
                 onerror="handleImageError(${index})">
            ${deleteButton.replace('INDEX', index)}
        </div>
    `).join('');
}

function handleImageLoad(index) {
    const item = document.getElementById(`gallery-item-${index}`);
    if (item) {
        item.classList.remove('loading', 'error');
    }
}

function handleImageError(index) {
    const item = document.getElementById(`gallery-item-${index}`);
    if (item) {
        item.classList.remove('loading');
        item.classList.add('error');
        
        if (currentUser.role === 'owner') {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'delete-btn';
            retryBtn.style.cssText = 'opacity: 1; background: rgba(255, 150, 0, 0.9);';
            retryBtn.textContent = '🔄';
            retryBtn.title = 'Retry loading or click to delete';
            retryBtn.onclick = () => deleteImage(index);
            item.appendChild(retryBtn);
        }
    }
}

function deleteImage(index) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can delete art!');
        return;
    }

    if (confirm('🐀 Delete this image from the gallery?')) {
        dataCache.gallery.splice(index, 1);
        renderGallery();
        showJsonUpdateInstructions('gallery', dataCache.gallery);
    }
}

function clearGallery() {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can clear the gallery!');
        return;
    }

    if (confirm('🐀 Clear the entire gallery? You\'ll need to update the JSON file.')) {
        dataCache.gallery = [];
        renderGallery();
        showJsonUpdateInstructions('gallery', dataCache.gallery);
    }
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
        return;
    }

    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.classList.add('active');
    modalTitle.textContent = botData ? '✏️ Edit Bot/Project' : '🐀 Add Bot/Project';

    const bot = botData || {
        icon: '🤖',
        name: '',
        description: '',
        servers: '',
        users: '',
        inviteLink: '',
        githubRepo: '',
        botFolder: ''
    };

    modalBody.innerHTML = `
        <label>Bot/Project Icon (emoji)</label>
        <input type="text" id="botIcon" value="${bot.icon}" placeholder="🤖">
        
        <label>Bot/Project Name</label>
        <input type="text" id="botName" value="${bot.name}" placeholder="My Awesome Bot">
        
        <label>Description</label>
        <textarea id="botDescription" rows="3" placeholder="What does your bot/project do?">${bot.description}</textarea>
        
        <label>Servers Count (optional)</label>
        <input type="text" id="botServers" value="${bot.servers}" placeholder="1.2K">
        
        <label>Users Count (optional)</label>
        <input type="text" id="botUsers" value="${bot.users}" placeholder="50K">
        
        <label>Invite Link (optional)</label>
        <input type="text" id="botInviteLink" value="${bot.inviteLink}" placeholder="https://discord.com/invite/...">
        
        <label>GitHub Repository (optional)</label>
        <input type="text" id="botGithubRepo" value="${bot.githubRepo}" placeholder="https://github.com/sorynTech/my-bot">
        
        <label>Bot Folder Path (optional)</label>
        <input type="text" id="botFolder" value="${bot.botFolder}" placeholder="./bots/my-bot/">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0 1rem 0;">
            If you store bot files in the repo (e.g., /bots/discord-bot/)
        </p>
        
        <button onclick="saveBot(${index})">Save Bot/Project 🐀</button>
        ${botData ? `<button onclick="deleteBot(${index})" style="background: var(--accent-secondary); margin-top: 0.5rem;">Delete 🗑️</button>` : ''}
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
        inviteLink: document.getElementById('botInviteLink').value,
        githubRepo: document.getElementById('botGithubRepo').value,
        botFolder: document.getElementById('botFolder').value
    };

    if (index !== null) {
        dataCache.bots[index] = botData;
    } else {
        dataCache.bots.push(botData);
    }

    renderBots();
    document.getElementById('editModal').classList.remove('active');
    
    // Show JSON update instructions
    showJsonUpdateInstructions('bots', dataCache.bots);
}

function deleteBot(index) {
    if (currentUser.role !== 'owner') {
        alert('❌ Only the owner can delete bots!');
        return;
    }

    if (confirm('🐀 Delete this bot/project?')) {
        dataCache.bots.splice(index, 1);
        renderBots();
        document.getElementById('editModal').classList.remove('active');
        showJsonUpdateInstructions('bots', dataCache.bots);
    }
}

function renderBots() {
    const botsGrid = document.getElementById('botsGrid');
    
    if (dataCache.bots.length === 0) {
        botsGrid.innerHTML = `
            <div class="bot-card">
                <div class="bot-icon">🤖</div>
                <h3 class="bot-name">Example Bot</h3>
                <p class="bot-description">A helpful Discord bot that does amazing things. Login as owner to add your own!</p>
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
    botsGrid.innerHTML = dataCache.bots.map((bot, index) => {
        const hasLinks = bot.inviteLink || bot.githubRepo || bot.botFolder;
        
        return `
            <div class="bot-card" ${isOwner ? `onclick="openBotModal(${JSON.stringify(bot).replace(/"/g, '&quot;')}, ${index})"` : ''} style="${isOwner ? 'cursor: pointer;' : ''}">
                <div class="bot-icon">${bot.icon}</div>
                <h3 class="bot-name">${bot.name}</h3>
                <p class="bot-description">${bot.description}</p>
                
                ${bot.servers || bot.users ? `
                    <div class="bot-stats">
                        ${bot.servers ? `<span class="stat"><strong>${bot.servers}</strong> Servers</span>` : ''}
                        ${bot.users ? `<span class="stat"><strong>${bot.users}</strong> Users</span>` : ''}
                    </div>
                ` : ''}
                
                ${hasLinks ? `
                    <div class="bot-links" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                        ${bot.inviteLink ? `
                            <a href="${bot.inviteLink}" class="bot-link-btn" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
                                📨 Invite
                            </a>
                        ` : ''}
                        ${bot.githubRepo ? `
                            <a href="${bot.githubRepo}" class="bot-link-btn bot-link-github" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                            </a>
                        ` : ''}
                        ${bot.botFolder ? `
                            <a href="${bot.botFolder}" class="bot-link-btn" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
                                📁 Files
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
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

    ['twitter', 'instagram', 'github', 'discord', 'kofi'].forEach(platform => {
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
                <label>Image Path</label>
                <input type="text" id="editInput" placeholder="./images/profile.jpg" value="./images/">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0 1rem 0;">
                    Upload image to /images folder in GitHub, then enter the path here
                </p>
                <button onclick="saveEdit('image')">Save 🐀</button>
            `;
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
    
    // Update profile cache
    dataCache.profile = {
        name: document.getElementById('lanyardName').textContent,
        role: document.getElementById('lanyardRole').textContent,
        image: document.getElementById('lanyardImage').src,
        socials: {
            twitter: document.getElementById('twitterLink').getAttribute('href'),
            instagram: document.getElementById('instagramLink').getAttribute('href'),
            github: document.getElementById('githubLink').getAttribute('href'),
            discord: document.getElementById('discordLink').getAttribute('href'),
            kofi: document.getElementById('kofiLink').getAttribute('href')
        }
    };
    
    showJsonUpdateInstructions('profile', dataCache.profile);
}

// Utility Functions
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    
    if (type === 'success') toast.style.background = 'linear-gradient(135deg, #7bed9f, #7dd3fc)';
    if (type === 'warning') toast.style.background = 'linear-gradient(135deg, #ffa502, #ff6348)';
    if (type === 'error') toast.style.background = 'linear-gradient(135deg, #ff006e, #ff0080)';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Clipboard functions
function copyToClipboard(text, platform) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyToast(platform, text);
            animateCopySuccess(event.currentTarget);
        }).catch(err => {
            fallbackCopy(text, platform);
        });
    } else {
        fallbackCopy(text, platform);
    }
}

function fallbackCopy(text, platform) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyToast(platform, text);
        animateCopySuccess(event.currentTarget);
    } catch (err) {
        alert('Failed to copy. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
}

function showCopyToast(platform, text) {
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
            <span style="font-size: 1.2rem;">✅</span>
            <div>
                <div style="font-size: 0.9rem; margin-bottom: 0.2rem;">${platform} username copied!</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">${text}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function animateCopySuccess(card) {
    card.classList.add('copied');
    setTimeout(() => {
        card.classList.remove('copied');
    }, 400);
}

// Make functions globally accessible
window.attemptLogin = attemptLogin;
window.saveEdit = saveEdit;
window.saveBot = saveBot;
window.deleteBot = deleteBot;
window.deleteImage = deleteImage;
window.openBotModal = openBotModal;
window.saveImageToManifest = saveImageToManifest;
window.copyToClipboard = copyToClipboard;
window.handleImageLoad = handleImageLoad;
window.handleImageError = handleImageError;
window.copyJsonToClipboard = copyJsonToClipboard;