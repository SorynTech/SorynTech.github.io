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
    commissions: [],
    projects: []
    };
    document.addEventListener('DOMContentLoaded', async function() {
    initNavigation();
    initAuth();
    initProfileEditing();
    initBotsSection();
    initProjectsSection();
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
    dataCache.projects = data.projects || [];
    if (dataCache.profile) applyProfileData(dataCache.profile);
    renderBots();
    renderProjects();
    renderGallery();
    renderCommissions();
    } else {
    dataCache.bots = [];
    dataCache.profile = null;
    dataCache.gallery = [];
    dataCache.commissions = [];
    dataCache.projects = [];
    renderBots();
    renderProjects();
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
    commissions: dataCache.commissions,
    projects: dataCache.projects
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
    await showAlert(data.error || '❌ Invalid credentials! Try again, rat.', '🐀  Access Denied');
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
    badgeIcon.textContent = '👑';
    } else if (currentUser.role === 'commission') {
    badgeIcon.textContent = '🎨';
    } else {
    badgeIcon.textContent = '👤';
    }
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
    const imageUpload = document.getElementById('imageUpload');
    if (uploadBtn) uploadBtn.addEventListener('click', () => imageUpload.click());
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
    if (addUrlBtn) addUrlBtn.addEventListener('click', addImageUrlModal);
    if (clearGalleryBtn) clearGalleryBtn.addEventListener('click', clearGallery);
    }
    function initCommissions() {
    const uploadCommissionBtn = document.getElementById('uploadCommissionBtn');
    const addCommissionUrlBtn = document.getElementById('addCommissionUrlBtn');
    const clearCommissionsBtn = document.getElementById('clearCommissionsBtn');
    const commissionImageUpload = document.getElementById('commissionImageUpload');
    if (uploadCommissionBtn) uploadCommissionBtn.addEventListener('click', () => commissionImageUpload.click());
    if (commissionImageUpload) commissionImageUpload.addEventListener('change', handleCommissionImageUpload);
    if (addCommissionUrlBtn) addCommissionUrlBtn.addEventListener('click', addCommissionUrlModal);
    if (clearCommissionsBtn) clearCommissionsBtn.addEventListener('click', clearCommissions);
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
    if (currentUser.role !== 'owner') {
    return;
    }
    if (index !== null && !botData) {
    botData = dataCache.bots[index];
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
    <div class="gallery-placeholder" style="padding: 3rem; text-align: center;">
    <div style="font-size: 3rem; margin-bottom: 1rem;">🐀</div>
    <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent-primary);">No Bots Yet</h3>
    <p style="color: var(--text-secondary); font-size: 1rem;">Nothing to see here... yet!</p>
    </div>
    `;
    return;
    }
    const isOwner = currentUser.role === 'owner';
    botsGrid.innerHTML = dataCache.bots.map((bot, index) => {
    const hasLinks = bot.inviteLink || bot.githubRepo || bot.botFolder;
    return `
    <div class="bot-card" ${isOwner ? `data-bot-index="${index}" onclick="openBotModal(null, ${index})"` : ''} style="${isOwner ? 'cursor: pointer;' : ''}">
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
    function initProjectsSection() {
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
    if (currentUser.role === 'owner') {
    openProjectModal();
    }
    });
    }
    }
    function openProjectModal(projectData = null, index = null) {
    if (currentUser.role !== 'owner') {
    return;
    }
    if (index !== null && !projectData) {
    projectData = dataCache.projects[index];
    }
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modal.classList.add('active');
    modalTitle.textContent = projectData ? '🐀 Edit Project' : '🐀 Add Project';
    const project = projectData || {
    icon: '💻',
    name: '',
    description: '',
    githubRepo: '',
    liveDemo: '',
    projectFolder: ''
    };
    modalBody.innerHTML = `
    <label>Project Icon (emoji)</label>
    <input type="text" id="projectIcon" value="${project.icon}" placeholder="💻">
    <label>Project Name</label>
    <input type="text" id="projectName" value="${project.name}" placeholder="My Awesome Project">
    <label>Description</label>
    <textarea id="projectDescription" rows="3" placeholder="What does your project do?">${project.description}</textarea>
    <label>GitHub Repository (optional)</label>
    <input type="text" id="projectGithubRepo" value="${project.githubRepo}" placeholder="https://github.com/sorynTech/my-project">
    <label>Live Demo Link (optional)</label>
    <input type="text" id="projectLiveDemo" value="${project.liveDemo}" placeholder="https://my-project.com">
    <label>Project Folder Path (optional)</label>
    <input type="text" id="projectFolder" value="${project.projectFolder}" placeholder="./projects/my-project/">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0 1rem 0;">
    If you store project files in the repo (e.g., /projects/my-project/)
    </p>
    <button onclick="saveProject(${index})">Save Project 🐀</button>
    ${projectData ? `<button onclick="deleteProject(${index})" style="background: var(--accent-secondary); margin-top: 0.5rem;">Delete 🐀</button>` : ''}
    `;
    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
    };
    }
    async function saveProject(index = null) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can save projects!', 'Permission Denied');
    return;
    }
    const projectData = {
    icon: document.getElementById('projectIcon').value,
    name: document.getElementById('projectName').value,
    description: document.getElementById('projectDescription').value,
    githubRepo: document.getElementById('projectGithubRepo').value,
    liveDemo: document.getElementById('projectLiveDemo').value,
    projectFolder: document.getElementById('projectFolder').value
    };
    if (index !== null) {
    dataCache.projects[index] = projectData;
    } else {
    dataCache.projects.push(projectData);
    }
    renderProjects();
    document.getElementById('editModal').classList.remove('active');
    await saveAllData();
    }
    async function deleteProject(index) {
    if (currentUser.role !== 'owner') {
    await showAlert('❌ Only the owner can delete projects!', 'Permission Denied');
    return;
    }
    if (await showConfirm('🐀 Delete this project?', 'Delete Project')) {
    dataCache.projects.splice(index, 1);
    renderProjects();
    document.getElementById('editModal').classList.remove('active');
    await saveAllData();
    }
    }
    function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (dataCache.projects.length === 0) {
    projectsGrid.innerHTML = `
    <div class="gallery-placeholder" style="padding: 3rem; text-align: center;">
    <div style="font-size: 3rem; margin-bottom: 1rem;">🐀</div>
    <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent-primary);">No Projects Yet</h3>
    <p style="color: var(--text-secondary); font-size: 1rem;">Nothing to see here... yet!</p>
    </div>
    `;
    return;
    }
    const isOwner = currentUser.role === 'owner';
    projectsGrid.innerHTML = dataCache.projects.map((project, index) => {
    const hasLinks = project.githubRepo || project.liveDemo || project.projectFolder;
    return `
    <div class="project-card" ${isOwner ? `data-project-index="${index}" onclick="openProjectModal(null, ${index})"` : ''} style="${isOwner ? 'cursor: pointer;' : ''}">
    <div class="project-icon">${project.icon}</div>
    <h3 class="project-name">${project.name}</h3>
    <p class="project-description">${project.description}</p>
    ${hasLinks ? `
    <div class="project-links">
    ${project.githubRepo ? `
    <a href="${project.githubRepo}" class="project-link-btn" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    GitHub
    </a>
    ` : ''}
    ${project.liveDemo ? `
    <a href="${project.liveDemo}" class="project-link-btn" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
    🔗 Live Demo
    </a>
    ` : ''}
    ${project.projectFolder ? `
    <a href="${project.projectFolder}" class="project-link-btn" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">
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
    const credsText = `Username: ${data.guestUser || 'Guest'}\nPassword: ${data.guestPass || 'Rat_Guest'}`;
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
const GITHUB_CONFIG = {
    username: 'SorynTech',
    accountCreatedAt: new Date('2025-11-01')
};

async function fetchGitHubContributions(username) {
    try {
        if (!CONFIG.API_BASE_URL) {
            console.warn('GitHub graph: API_BASE_URL not configured, using demo data');
            return createDemoGraph(GITHUB_CONFIG.accountCreatedAt, true);
        }

        // Try the real GraphQL contributions endpoint first
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/api/github/contributions?username=${encodeURIComponent(username)}`
        );

        if (response.ok) {
            const data = await response.json();
            if (data.weeks && Array.isArray(data.weeks)) {
                return parseRealContributions(data);
            }
        }

        // If contributions endpoint failed, try the user endpoint for account age at least
        console.warn('GitHub graph: contributions endpoint failed, falling back to demo data');
        const userResp = await fetch(
            `${CONFIG.API_BASE_URL}/api/github/user?username=${encodeURIComponent(username)}`
        );
        if (userResp.ok) {
            const userData = await userResp.json();
            if (userData.created_at) {
                return createDemoGraph(new Date(userData.created_at), true);
            }
        }

        return createDemoGraph(GITHUB_CONFIG.accountCreatedAt, true);
    } catch (error) {
        console.error('Error fetching GitHub contributions:', error);
        return createDemoGraph(GITHUB_CONFIG.accountCreatedAt, true);
    }
}

/**
 * Parse the real contribution data returned by the Worker's GraphQL proxy
 * into the shape expected by renderGitHubGraph.
 */
function parseRealContributions(data) {
    const accountCreatedAt = data.createdAt ? new Date(data.createdAt) : GITHUB_CONFIG.accountCreatedAt;
    const now = new Date();

    // data.weeks already has the right shape from GitHub's API:
    // [ { contributionDays: [ { date, contributionCount } ] } ]
    const weeks = (data.weeks || []).map(week => ({
        contributionDays: week.contributionDays.map(day => ({
            date: day.date,
            contributionCount: day.contributionCount
        }))
    }));

    const totalContributions = data.totalContributions ?? weeks.reduce(
        (sum, w) => sum + w.contributionDays.reduce((s, d) => s + d.contributionCount, 0), 0
    );

    const accountAgeDays = Math.floor((now - accountCreatedAt) / (1000 * 60 * 60 * 24));
    const accountAgeYears = Math.floor(accountAgeDays / 365);
    const accountAgeMonths = Math.floor((accountAgeDays % 365) / 30);

    return {
        totalContributions,
        weeks,
        accountCreatedAt,
        isDemo: false,
        accountAge: {
            days: accountAgeDays,
            display: `${accountAgeYears}y ${accountAgeMonths}m`
        }
    };
}

/**
 * Generate random demo contribution data as a fallback.
 * @param {Date} accountCreatedAt
 * @param {boolean} isDemo  marks the result so the renderer can show a "Demo" badge
 */
function createDemoGraph(accountCreatedAt, isDemo = true) {
    const now = new Date();
    const weeks = [];
    
    // Show last 52 weeks (1 year) of activity
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (52 * 7));
    
    // Ensure we start from account creation if it's more recent
    if (startDate < accountCreatedAt) {
        startDate.setTime(accountCreatedAt.getTime());
    }
    
    let currentDate = new Date(startDate);
    let totalContributions = 0;
    
    while (currentDate <= now) {
        const week = { contributionDays: [] };
        
        for (let i = 0; i < 7 && currentDate <= now; i++) {
            // Only add days after account creation
            if (currentDate >= accountCreatedAt) {
                // Generate realistic-looking contribution pattern
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                // More activity on weekdays, less on weekends
                const baseActivity = isWeekend ? Math.random() * 3 : Math.random() * 8;
                const count = Math.floor(baseActivity);
                
                totalContributions += count;
                
                week.contributionDays.push({
                    date: currentDate.toISOString().split('T')[0],
                    contributionCount: count
                });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (week.contributionDays.length > 0) {
            weeks.push(week);
        }
    }
    
    // Calculate account age once for reuse
    const accountAgeDays = Math.floor((now - accountCreatedAt) / (1000 * 60 * 60 * 24));
    const accountAgeYears = Math.floor(accountAgeDays / 365);
    const accountAgeMonths = Math.floor((accountAgeDays % 365) / 30);
    
    return {
        totalContributions,
        weeks,
        accountCreatedAt,
        isDemo: isDemo,
        accountAge: {
            days: accountAgeDays,
            display: `${accountAgeYears}y ${accountAgeMonths}m`
        }
    };
}


function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function renderGitHubGraph(calendar) {
    const container = document.getElementById('github-contribution-graph');
    if (!calendar) {
        container.innerHTML = '<p style="color: #586069; text-align: center;">Unable to load contribution data. This feature requires GitHub authentication.</p>';
        return;
    }
    
    if (calendar.error) {
        container.innerHTML = '<p style="color: #586069; text-align: center;">API not configured</p>';
        return;
    }
    if (calendar.isDemo) {
        const demoBanner = document.createElement('div');
        demoBanner.style.cssText = 'text-align:center;padding:0.4rem 0.8rem;margin-bottom:0.75rem;' +
            'background:rgba(255,165,0,0.15);border:1px solid rgba(255,165,0,0.4);border-radius:8px;' +
            'color:#ffa502;font-size:0.85rem;font-weight:500;';
        demoBanner.textContent = '⚠️ Demo / Sample Data — GitHub API key not configured';
        container.appendChild(demoBanner);
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    document.body.appendChild(tooltip);
    
    // Create graph container
    const graphWrapper = document.createElement('div');
    graphWrapper.className = 'contribution-graph';
    
    // Render contribution squares
    calendar.weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'contribution-week';
        
        week.contributionDays.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = `contribution-day level-${getContributionLevel(day.contributionCount)}`;
            dayDiv.dataset.date = day.date;
            dayDiv.dataset.count = day.contributionCount;
            dayDiv.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                tooltip.textContent = `${day.contributionCount} contributions on ${formatDate(day.date)}`;
                tooltip.style.display = 'block';
                let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
                let top = rect.top - tooltip.offsetHeight - 10;
                if (left < 0) left = 5;
                if (left + tooltip.offsetWidth > window.innerWidth) {
                    left = window.innerWidth - tooltip.offsetWidth - 5;
                }
                if (top < 0) {
                    top = rect.bottom + 10;
                }
                
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });
            
            dayDiv.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
            
            weekDiv.appendChild(dayDiv);
        });
        
        graphWrapper.appendChild(weekDiv);
    });
    
    // Create legend
    const legend = document.createElement('div');
    legend.className = 'graph-legend';
    legend.innerHTML = `
        <span>Less</span>
        <div class="legend-scale">
            <div class="legend-day level-0"></div>
            <div class="legend-day level-1"></div>
            <div class="legend-day level-2"></div>
            <div class="legend-day level-3"></div>
            <div class="legend-day level-4"></div>
        </div>
        <span>More</span>
    `;
    const stats = document.createElement('div');
    stats.className = 'graph-stats';
    
    const totalDays = calendar.weeks.reduce((sum, week) => sum + week.contributionDays.length, 0);
    const activeDays = calendar.weeks.reduce((sum, week) => 
        sum + week.contributionDays.filter(day => day.contributionCount > 0).length, 0);
    const avgPerDay = (calendar.totalContributions / totalDays).toFixed(1);
    let accountInfo = '';
    if (calendar.accountAge) {
        accountInfo = `
        <div class="stat-item">
            <div class="stat-value">${calendar.accountAge.display}</div>
            <div class="stat-label">Account Age</div>
        </div>
        `;
    }
    
    stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${calendar.totalContributions.toLocaleString()}</div>
            <div class="stat-label">Total Contributions</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${activeDays.toLocaleString()}</div>
            <div class="stat-label">Active Days</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgPerDay}</div>
            <div class="stat-label">Avg per Day</div>
        </div>
        ${accountInfo}
    `;
    container.innerHTML = '';
    container.appendChild(graphWrapper);
    container.appendChild(legend);
    container.appendChild(stats);
}
async function initGitHubGraph() {
    const calendar = await fetchGitHubContributions(GITHUB_CONFIG.username);
    renderGitHubGraph(calendar);
}
document.addEventListener('DOMContentLoaded', function() {
    initGitHubGraph();
});
