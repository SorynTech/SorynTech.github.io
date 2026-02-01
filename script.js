const CONFIG = (() => {
    const el = document.getElementById('app-config');
    const apiUrl = (el?.dataset?.apiUrl || '').replace(/\/$/, '');
    if (el) el.remove();
    return Object.freeze({ API_BASE_URL: apiUrl });
    })();
    function getAuthToken() {
    return sessionStorage.getItem('authToken');
    }
    function setAuthToken(token) {
    if (token) sessionStorage.setItem('authToken', token);
    else sessionStorage.removeItem('authToken');
    }
    let currentUser = {
    username: null,
    role: 'guest',
    isLoggedIn: false
    };
    let dataCache = {
    bots: [],
    profile: null,
    gallery: [],
    commissions: []
    };
    document.addEventListener('DOMContentLoaded', async function() {
    initNavigation();
    initAuth();
    initProfileEditing();
    initBotsSection();
    initGallery();
    initCommissions();
    await checkAuthState();
    if (currentUser.isLoggedIn) await loadAllData();
    });
    async function loadFromJSONBin() {
    if (!CONFIG.API_BASE_URL) {
    showNotification('❌ API URL not configured (data-api-url)', 'warning');
    return null;
    }
    const token = getAuthToken();
    if (!token) return null;
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/data`, {
    headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
    const data = await response.json();
    return data;
    }
    if (response.status === 401) {
    setAuthToken(null);
    currentUser = { username: null, role: 'guest', isLoggedIn: false };
    updateUIForRole();
    }
    return null;
    } catch (e) {
    console.error('Error loading data:', e);
    showNotification('❌ Could not connect to API', 'warning');
    return null;
    }
    }
    async function saveToJSONBin(data) {
    if (!CONFIG.API_BASE_URL) {
    showNotification('❌ API URL not configured', 'error');
    return false;
    }
    const token = getAuthToken();
    if (!token) {
    showNotification('❌ Not logged in', 'error');
    return false;
    }
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/data`, {
    method: 'PUT',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
    });
    if (response.ok) {
    showNotification('✅ Saved to cloud!', 'success');
    return true;
    }
    const err = await response.json().catch(() => ({}));
    showNotification(err.error || '❌ Failed to save', 'error');
    return false;
    } catch (e) {
    console.error('Error saving:', e);
    showNotification('❌ Network error while saving', 'error');
    return false;
    }
    }
    async function uploadToImgBB(file) {
    if (!CONFIG.API_BASE_URL) {
    showNotification('❌ API URL not configured', 'warning');
    return null;
    }
    const token = getAuthToken();
    if (!token) {
    showNotification('❌ Not logged in', 'error');
    return null;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
    showNotification('⏳ Uploading image...', 'info');
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.url) {
    showNotification('✅ Image uploaded!', 'success');
    return result.url;
    }
    showNotification(result.error || '❌ Upload failed', 'error');
    return null;
    } catch (e) {
    console.error('Upload error:', e);
    showNotification('❌ Network error during upload', 'error');
    return null;
    }
    }
    async function loadAllData() {
    try {
    const data = await loadFromJSONBin();
    if (data) {
    dataCache.bots = data.bots || [];
    dataCache.profile = data.profile || null;
    dataCache.gallery = data.gallery || [];
    dataCache.commissions = data.commissions || [];
    if (dataCache.profile) applyProfileData(dataCache.profile);
    renderBots();
    renderGallery();
    renderCommissions();
    } else {
    dataCache.bots = [];
    dataCache.profile = null;
    dataCache.gallery = [];
    dataCache.commissions = [];
    renderBots();
    renderGallery();
    renderCommissions();
    }
    } catch (error) {
    console.error('Error loading data:', error);
    showNotification('❌ Could not load data from cloud', 'warning');
    }
    }
    async function saveAllData() {
    const data = {
    bots: dataCache.bots,
    profile: dataCache.profile,
    gallery: dataCache.gallery,
    commissions: dataCache.commissions
    };
    if (currentUser.role === 'commission') {
    return await saveCommissionsOnly();
    }
    return await saveToJSONBin(data);
    }
    async function saveCommissionsOnly() {
    const data = {
    commissions: dataCache.commissions
    };
    return await saveToJSONBin(data);
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
    function initAuth() {
    const userBadge = document.getElementById('userBadge');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    userBadge.addEventListener('click', async () => {
    if (currentUser.isLoggedIn) {
    if (await showConfirm('Are you sure you want to logout?', 'Logout')) {
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
    async function attemptLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginModal = document.getElementById('loginModal');
    if (!CONFIG.API_BASE_URL) {
    await showAlert('❌ API URL not configured. Set data-api-url on #app-config.', 'Configuration Error');
    return;
    }
    if (!username || !password) {
    await showAlert('❌ Enter username and password.', 'Missing Credentials');
    return;
    }
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.token && data.role) {
    setAuthToken(data.token);
    login(data.role, data.username);
    loginModal.classList.remove('active');
    await loadAllData();
    } else {
    await showAlert(data.error || '❌ Invalid credentials! Try again, rat.', 'ðŸ€ Access Denied');
    document.getElementById('loginPassword').value = '';
    }
    } catch (e) {
    console.error('Login error:', e);
    await showAlert('❌ Could not reach API. Check URL and network.', 'Connection Error');
    }
    }
    function login(role, username) {
    currentUser = { username, role, isLoggedIn: true };
    updateUIForRole();
    unlockGallery();
    if (role === 'owner' || role === 'commission') {
    unlockCommissions();
    }
    }
    function logout() {
    currentUser = { username: null, role: 'guest', isLoggedIn: false };
    setAuthToken(null);
    updateUIForRole();
    location.reload();
    }
    async function checkAuthState() {
    const token = getAuthToken();
    if (!token || !CONFIG.API_BASE_URL) return;
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
    const data = await response.json();
    currentUser = {
    username: data.username,
    role: data.role,
    isLoggedIn: true
    };
    updateUIForRole();
    unlockGallery();
    if (data.role === 'owner' || data.role === 'commission') {
    unlockCommissions();
    }
    } else {
    setAuthToken(null);
    }
    } catch {
    setAuthToken(null);
    }
    }
    function updateUIForRole() {
    const userBadge = document.getElementById('userBadge');
    const badgeIcon = userBadge.querySelector('.badge-icon');
    const badgeText = userBadge.querySelector('.badge-text');
    if (currentUser.isLoggedIn) {
    if (currentUser.role === 'owner') {
    badgeIcon.textContent = 'ðŸ‘‘';
    } else if (currentUser.role === 'commission') {
    badgeIcon.textContent = 'ðŸŽ¨';
    } else {
    badgeIcon.textContent = 'ðŸ€';
    }
    badgeText.textContent = currentUser.username;
    userBadge.title = 'Click to logout';
    } else {
    badgeIcon.textContent = 'ðŸ”’';
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
    const commissionOnlyElements = document.querySelectorAll('.commission-only');
    commissionOnlyElements.forEach(el => {
    if (currentUser.role === 'owner' || currentUser.role === 'commission') {
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
    function initGallery() {
    const uploadBtn = document.getElementById('uploadBtn');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const unlockBtn = document.getElementById('unlockBtn');
    const artUsername = document.getElementById('artUsername');
    const artPassword = document.getElementById('artPassword');
    const imageUpload = document.getElementById('imageUpload');
    if (uploadBtn) uploadBtn.addEventListener('click', () => imageUpload.click());
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
    if (addUrlBtn) addUrlBtn.addEventListener('click', addImageUrlModal);
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
    function initCommissions() {
    const uploadCommissionBtn = document.getElementById('uploadCommissionBtn');
    const addCommissionUrlBtn = document.getElementById('addCommissionUrlBtn');
    const clearCommissionsBtn = document.getElementById('clearCommissionsBtn');
    const unlockCommissionsBtn = document.getElementById('unlockCommissionsBtn');
    const commissionUsername = document.getElementById('commissionUsername');
    const commissionPassword = document.getElementById('commissionPassword');
    const commissionImageUpload = document.getElementById('commissionImageUpload');
    if (uploadCommissionBtn) uploadCommissionBtn.addEventListener('click', () => commissionImageUpload.click());
    if (commissionImageUpload) commissionImageUpload.addEventListener('change', handleCommissionImageUpload);
    if (addCommissionUrlBtn) addCommissionUrlBtn.addEventListener('click', addCommissionUrlModal);
    if (clearCommissionsBtn) clearCommissionsBtn.addEventListener('click', clearCommissions);
    if (unlockCommissionsBtn) unlockCommissionsBtn.addEventListener('click', checkCommissionsPassword);
    if (commissionUsername) {
    commissionUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') commissionPassword.focus();
    });
    }
    if (commissionPassword) {
    commissionPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkCommissionsPassword();
    });
    }
    }
    async function handleImageUpload(event) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can upload images!', 'Permission Denied');
    return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) return;
    for (let file of files) {
    if (!file.type.startsWith('image/')) {
    showNotification(`❌ ${file.name} is not an image`, 'warning');
    continue;
    }
    const imageUrl = await uploadToImgBB(file);
    if (imageUrl) {
    const newImage = {
    src: imageUrl,
    title: file.name.replace(/\.[^/.]+$/, ""),
    description: `Uploaded ${new Date().toLocaleDateString()}`,
    timestamp: Date.now()
    };
    dataCache.gallery.push(newImage);
    }
    }
    renderGallery();
    await saveAllData();
    event.target.value = '';
    }
    async function handleCommissionImageUpload(event) {
    if (currentUser.role !== 'owner' && currentUser.role !== 'commission') {
    await showAlert('❌ Only the owner or commission artists can upload images!', 'Permission Denied');
    return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) return;
    for (let file of files) {
    if (!file.type.startsWith('image/')) {
    showNotification(`❌ ${file.name} is not an image`, 'warning');
    continue;
    }
    const imageUrl = await uploadToImgBB(file);
    if (imageUrl) {
    const newImage = {
    src: imageUrl,
    title: file.name.replace(/\.[^/.]+$/, ""),
    description: `Uploaded ${new Date().toLocaleDateString()}`,
    timestamp: Date.now()
    };
    dataCache.commissions.push(newImage);
    }
    }
    renderCommissions();
    await saveAllData();
    event.target.value = '';
    }
    function addImageUrlModal() {
    if (currentUser.role !== 'owner') {
    showAlert('❌ Only the owner can add images!', 'Permission Denied');
    return;
    }
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modal.classList.add('active');
    modalTitle.textContent = '🎨 Add Image to Gallery';
    modalBody.innerHTML = `
    <label>Image URL</label>
    <input type="text" id="imagePathInput" placeholder="https://i.ibb.co/xxxxx/imagename.jpg">
    <div style="margin: 1rem 0; padding: 1rem; background: rgba(125, 211, 252, 0.1); border-radius: 10px;">
    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
    <strong>🖼️ Upload to ImgBB first:</strong><br>
    1. Go to <a href="https://imgbb.com" target="_blank" style="color: var(--accent-primary);">imgbb.com</a><br>
    2. Upload your image<br>
    3. Copy the direct link<br>
    4. Paste it above
    </p>
    <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
    <strong>🖼️ Or use the Upload button to auto-upload!</strong>
    </p>
    </div>
    <label>Image Title (optional)</label>
    <input type="text" id="imageTitleInput" placeholder="My Artwork">
    <label>Image Description (optional)</label>
    <textarea id="imageDescInput" rows="2" placeholder="Description of the artwork"></textarea>
    <button onclick="saveImageUrl()">Add to Gallery 🐀</button>
    `;
    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
    };
    }
    function addCommissionUrlModal() {
    if (currentUser.role !== 'owner' && currentUser.role !== 'commission') {
    showAlert('❌ Only the owner or commission artists can add images!', 'Permission Denied');
    return;
    }
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modal.classList.add('active');
    modalTitle.textContent = '🎨 Add Commission Image';
    modalBody.innerHTML = `
    <label>Image URL</label>
    <input type="text" id="commissionImagePathInput" placeholder="https://...">
    <div style="margin: 1rem 0; padding: 1rem; background: rgba(125, 211, 252, 0.1); border-radius: 10px;">
    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
    <strong>🎨 Supported Platforms:</strong>
    </p>
    <ul style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 1.5rem;">
    <li>ImgBB - imgbb.com</li>
    <li>Catbox - catbox.moe</li>
    <li>PostImages - postimages.org</li>
    <li>Cloudinary - cloudinary.com</li>
    <li>Discord CDN - cdn.discordapp.com</li>
    <li>GitHub - raw.githubusercontent.com</li>
    <li>Any direct image URL</li>
    </ul>
    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
    🖼️ Or use the <strong>Upload button</strong> to auto-upload to ImgBB!
    </p>
    </div>
    <label>Image Title (optional)</label>
    <input type="text" id="commissionImageTitleInput" placeholder="Commission Title">
    <label>Image Description (optional)</label>
    <textarea id="commissionImageDescInput" rows="2" placeholder="Client name, commission details..."></textarea>
    <button onclick="saveCommissionUrl()">Add to Gallery 🎨</button>
    `;
    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
    };
    }
    async function saveImageUrl() {
    const url = document.getElementById('imagePathInput').value.trim();
    const title = document.getElementById('imageTitleInput').value.trim();
    const description = document.getElementById('imageDescInput').value.trim();
    if (!url) {
    await showAlert('❌ Please enter an image URL!', 'Missing URL');
    return;
    }
    const newImage = {
    src: url,
    title: title || `Artwork ${dataCache.gallery.length + 1}`,
    description: description,
    timestamp: Date.now()
    };
    dataCache.gallery.push(newImage);
    renderGallery();
    document.getElementById('editModal').classList.remove('active');
    await saveAllData();
    }
    async function saveCommissionUrl() {
    const url = document.getElementById('commissionImagePathInput').value.trim();
    const title = document.getElementById('commissionImageTitleInput').value.trim();
    const description = document.getElementById('commissionImageDescInput').value.trim();
    if (!url) {
    await showAlert('❌ Please enter an image URL!', 'Missing URL');
    return;
    }
    const newImage = {
    src: url,
    title: title || `Commission ${dataCache.commissions.length + 1}`,
    description: description,
    timestamp: Date.now()
    };
    dataCache.commissions.push(newImage);
    renderCommissions();
    document.getElementById('editModal').classList.remove('active');
    await saveAllData();
    }
    async function checkGalleryPassword() {
    const username = document.getElementById('artUsername').value.trim();
    const password = document.getElementById('artPassword').value;
    if (!CONFIG.API_BASE_URL || !username || !password) {
    await showAlert('❌ Enter username and password.', 'Missing Credentials');
    return;
    }
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.token && data.role) {
    setAuthToken(data.token);
    currentUser = { username: data.username, role: data.role, isLoggedIn: true };
    updateUIForRole();
    unlockGallery();
    await loadAllData();
    } else {
    await showAlert(data.error || '❌ Access denied! Wrong credentials, rat.', 'ðŸ€ Access Denied');
    document.getElementById('artPassword').value = '';
    }
    } catch (e) {
    console.error('Login error:', e);
    await showAlert('❌ Could not reach API.', 'Connection Error');
    }
    }
    async function checkCommissionsPassword() {
    const username = document.getElementById('commissionUsername').value.trim();
    const password = document.getElementById('commissionPassword').value;
    if (!CONFIG.API_BASE_URL || !username || !password) {
    await showAlert('❌ Enter username and password.', 'Missing Credentials');
    return;
    }
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.token && data.role) {
    setAuthToken(data.token);
    currentUser = { username: data.username, role: data.role, isLoggedIn: true };
    updateUIForRole();
    unlockCommissions();
    await loadAllData();
    } else {
    await showAlert(data.error || '❌ Access denied! Wrong credentials.', 'ðŸŽ¨ Access Denied');
    document.getElementById('commissionPassword').value = '';
    }
    } catch (e) {
    console.error('Login error:', e);
    await showAlert('❌ Could not reach API.', 'Connection Error');
    }
    }
    function unlockGallery() {
    const passwordOverlay = document.getElementById('passwordOverlay');
    const galleryContent = document.querySelector('.gallery-content');
    if (passwordOverlay) passwordOverlay.classList.add('unlocked');
    if (galleryContent) galleryContent.classList.add('unlocked');
    }
    function unlockCommissions() {
    const passwordOverlay = document.getElementById('commissionsPasswordOverlay');
    const commissionsContent = document.getElementById('commissionsContent');
    if (passwordOverlay) passwordOverlay.classList.add('unlocked');
    if (commissionsContent) commissionsContent.classList.add('unlocked');
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
    ? '<button class="delete-btn" onclick="deleteImage(INDEX)">❌</button>'
    : '';
    galleryGrid.innerHTML = dataCache.gallery.map((item, index) => `
    <div class="gallery-item loading" id="gallery-item-${index}" onclick="expandImage('${item.src.replace(/'/g, "\\'")}', '${(item.title || '').replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}')">
    <img src="${item.src}"
    alt="${item.title || 'Art ' + (index + 1)}"
    title="${item.description || item.title || ''}"
    onload="handleImageLoad(${index})"
    onerror="handleImageError(${index})">
    ${deleteButton.replace('INDEX', index)}
    </div>
    `).join('');
    }
    function renderCommissions() {
    const commissionsGrid = document.getElementById('commissionsGrid');
    if (dataCache.commissions.length === 0) {
    commissionsGrid.innerHTML = `
    <div class="gallery-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    <p>Commissioned artwork will appear here...</p>
    </div>
    `;
    return;
    }
    const canDelete = currentUser.role === 'owner' || currentUser.role === 'commission';
    const deleteButton = canDelete
    ? '<button class="delete-btn" onclick="deleteCommission(INDEX)">❌</button>'
    : '';
    commissionsGrid.innerHTML = dataCache.commissions.map((item, index) => `
    <div class="gallery-item loading" id="commission-item-${index}" onclick="expandImage('${item.src.replace(/'/g, "\\'")}', '${(item.title || '').replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}')">
    <img src="${item.src}"
    alt="${item.title || 'Commission ' + (index + 1)}"
    title="${item.description || item.title || ''}"
    onload="handleCommissionLoad(${index})"
    onerror="handleCommissionError(${index})">
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
    retryBtn.textContent = '🐀';
    retryBtn.title = 'Retry loading or click to delete';
    retryBtn.onclick = (e) => {
    e.stopPropagation();
    deleteImage(index);
    };
    item.appendChild(retryBtn);
    }
    }
    }
    function handleCommissionLoad(index) {
    const item = document.getElementById(`commission-item-${index}`);
    if (item) {
    item.classList.remove('loading', 'error');
    }
    }
    function handleCommissionError(index) {
    const item = document.getElementById(`commission-item-${index}`);
    if (item) {
    item.classList.remove('loading');
    item.classList.add('error');
    if (currentUser.role === 'owner' || currentUser.role === 'commission') {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'delete-btn';
    retryBtn.style.cssText = 'opacity: 1; background: rgba(255, 150, 0, 0.9);';
    retryBtn.textContent = 'ðŸ”„';
    retryBtn.title = 'Retry loading or click to delete';
    retryBtn.onclick = (e) => {
    e.stopPropagation();
    deleteCommission(index);
    };
    item.appendChild(retryBtn);
    }
    }
    }
    async function deleteImage(index) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can delete art!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🐀 Delete this image from the gallery?', 'Delete Image')) {
    dataCache.gallery.splice(index, 1);
    renderGallery();
    await saveAllData();
    }
    }
    async function deleteCommission(index) {
    if (currentUser.role !== 'owner' && currentUser.role !== 'commission') {
    await showAlert('❌ Only the owner or commission artists can delete!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🎨 Delete this commission from the gallery?', 'Delete Commission')) {
    dataCache.commissions.splice(index, 1);
    renderCommissions();
    await saveAllData();
    }
    }
    async function clearGallery() {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can clear the gallery!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🐀 Clear the entire gallery? This cannot be undone!', 'Clear Gallery')) {
    dataCache.gallery = [];
    renderGallery();
    await saveAllData();
    }
    }
    async function clearCommissions() {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can clear the commissions gallery!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🎨 Clear the entire commission gallery? This cannot be undone!', 'Clear Gallery')) {
    dataCache.commissions = [];
    renderCommissions();
    await saveAllData();
    }
    }
    function expandImage(src, title, description) {
    const modal = document.getElementById('imageExpandModal');
    const img = document.getElementById('expandedImage');
    const titleEl = document.getElementById('expandedImageTitle');
    const descEl = document.getElementById('expandedImageDesc');
    modal.classList.add('active');
    img.src = src;
    if (titleEl) titleEl.textContent = title || '';
    if (descEl) descEl.textContent = description || '';
    document.getElementById('closeImageExpand').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
    };
    }
    function showAlert(message, title = 'Notice') {
    return new Promise((resolve) => {
    const modal = document.getElementById('alertModal');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const okBtn = document.getElementById('alertOkBtn');
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('active');
    const handleOk = () => {
    modal.classList.remove('active');
    okBtn.removeEventListener('click', handleOk);
    resolve();
    };
    okBtn.addEventListener('click', handleOk);
    });
    }
    function showConfirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');
    const noBtn = document.getElementById('confirmNoBtn');
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('active');
    const handleYes = () => {
    modal.classList.remove('active');
    cleanup();
    resolve(true);
    };
    const handleNo = () => {
    modal.classList.remove('active');
    cleanup();
    resolve(false);
    };
    const cleanup = () => {
    yesBtn.removeEventListener('click', handleYes);
    noBtn.removeEventListener('click', handleNo);
    };
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
    });
    }
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
    modalTitle.textContent = botData ? '🐀 Edit Bot/Project' : '🐀 Add Bot/Project';
    const bot = botData || {
    icon: '🐀',
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
    <input type="text" id="botIcon" value="${bot.icon}" placeholder="🐀">
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
    ${botData ? `<button onclick="deleteBot(${index})" style="background: var(--accent-secondary); margin-top: 0.5rem;">Delete 🐀</button>` : ''}
    `;
    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
    };
    }
    async function saveBot(index = null) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can save bots!', 'Permission Denied');
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
    await saveAllData();
    }
    async function deleteBot(index) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can delete bots!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🐀 Delete this bot/project?', 'Delete Bot')) {
    dataCache.bots.splice(index, 1);
    renderBots();
    document.getElementById('editModal').classList.remove('active');
    await saveAllData();
    }
    }
    function renderBots() {
    const botsGrid = document.getElementById('botsGrid');
    if (dataCache.bots.length === 0) {
    botsGrid.innerHTML = `
    <div class="bot-card">
    <div class="bot-icon">🐀</div>
    <h3 class="bot-name">Example Bot</h3>
    <p class="bot-description">A helpful Discord bot that does amazing things. Login as owner to add your own!</p>
    <div class="bot-stats">
    <span class="stat"><strong>1.2K</strong> Servers</span>
    <span class="stat"><strong>50K</strong> Users</span>
    </div>
    <a href="#" class="bot-link">Invite Bot ✉️</a>
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
    ✉️ Invite
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
    showAlert('❌ Only the owner can edit this!', 'Permission Denied');
    return;
    }
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modal.classList.add('active');
    switch(type) {
    case 'name':
    modalTitle.textContent = '🐀 Edit Name';
    modalBody.innerHTML = `
    <label>Display Name</label>
    <input type="text" id="editInput" value="${document.getElementById('lanyardName').textContent}">
    <button onclick="saveEdit('name')">Save 🐀</button>
    `;
    break;
    case 'role':
    modalTitle.textContent = '🐀 Edit Role';
    modalBody.innerHTML = `
    <label>Your Role/Title</label>
    <input type="text" id="editInput" value="${document.getElementById('lanyardRole').textContent}">
    <button onclick="saveEdit('role')">Save 🐀</button>
    `;
    break;
    case 'image':
    modalTitle.textContent = '🐀 Change Profile Picture';
    modalBody.innerHTML = `
    <label>Image URL (from ImgBB)</label>
    <input type="text" id="editInput" placeholder="https://i.ibb.co/...">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0 1rem 0;">
    Upload your profile image to <a href="https://imgbb.com" target="_blank" style="color: var(--accent-primary);">ImgBB</a> and paste the URL here
    </p>
    <button onclick="saveEdit('image')">Save 🐀</button>
    `;
    break;
    case 'social':
    modalTitle.textContent = `🐀 Edit ${platform.charAt(0).toUpperCase() + platform.slice(1)} Link`;
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
    async function saveEdit(type, platform = null) {
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
    await saveAllData();
    }
    function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    if (type === 'success') toast.style.background = 'linear-gradient(135deg, #7bed9f, #7dd3fc)';
    if (type === 'warning') toast.style.background = 'linear-gradient(135deg, #ffa502, #ff6348)';
    if (type === 'error') toast.style.background = 'linear-gradient(135deg, #ff006e, #ff0080)';
    if (type === 'info') toast.style.background = 'linear-gradient(135deg, #7dd3fc, #a855f7)';
    document.body.appendChild(toast);
    setTimeout(() => {
    toast.remove();
    }, 3000);
    }
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
    showAlert('Failed to copy. Please copy manually: ' + text, 'Copy Failed');
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
    <span style="font-size: 1.2rem;">🐀</span>
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
    window.attemptLogin = attemptLogin;
    window.saveEdit = saveEdit;
    window.saveBot = saveBot;
    window.deleteBot = deleteBot;
    window.deleteImage = deleteImage;
    window.deleteCommission = deleteCommission;
    window.openBotModal = openBotModal;
    window.saveImageUrl = saveImageUrl;
    window.saveCommissionUrl = saveCommissionUrl;
    window.copyToClipboard = copyToClipboard;
    window.handleImageLoad = handleImageLoad;
    window.handleImageError = handleImageError;
    window.handleCommissionLoad = handleCommissionLoad;
    window.handleCommissionError = handleCommissionError;
    window.expandImage = expandImage;
    window.showAlert = showAlert;
    window.showConfirm = showConfirm;
    async function loadGuestCredentials() {
    if (!CONFIG.API_BASE_URL) return;
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/credentials`);
    if (response.ok) {
    const data = await response.json();
    const artCreds = document.getElementById('artGuestCreds');
    const commCreds = document.getElementById('commissionsGuestCreds');
    const credsText = `Username: ${data.guestUser || 'guest'}\nPassword: ${data.guestPass || '(not set)'}`;
    if (artCreds) {
    const valueEl = artCreds.querySelector('.credentials-value');
    if (valueEl) valueEl.textContent = credsText;
    }
    if (commCreds) {
    const valueEl = commCreds.querySelector('.credentials-value');
    if (valueEl) valueEl.textContent = credsText;
    }
    }
    } catch (e) {
    console.error('Failed to load guest credentials:', e);
    }
    }
    document.addEventListener('DOMContentLoaded', function() {
    loadGuestCredentials();
    });