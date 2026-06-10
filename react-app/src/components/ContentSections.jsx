import React, { useState, useRef } from 'react';
import { SectionSkeleton } from './Skeletons';
import { Modal, ConfirmModal } from './Modal';

function LoginPlaceholder({ message }) {
  return (
    <div className="gallery-placeholder" style={{ padding: '3rem', textAlign: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Login Required</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{message}</p>
      <div className="guest-credentials" style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}>
        <p className="credentials-label">Guest Access:</p>
        <p className="credentials-value">Username: Guest<br />Password: Rat_Guest</p>
      </div>
    </div>
  );
}

function ImageExpandModal({ isOpen, onClose, image }) {
  if (!isOpen || !image) return null;
  return (
    <div className="modal" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="image-expand-content" style={{ position: 'relative' }}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <img src={image.url || image.src} alt={image.title || 'Expanded'} />
        {(image.title || image.description || image.artistName || image.artistLink) && (
          <div className="image-expand-info">
            {image.title && <h3>{image.title}</h3>}
            {image.description && <p>{image.description}</p>}
            {(image.artistName || image.artistLink) && (
              <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {image.artistName && <p><strong>🎨 Artist:</strong> {image.artistName}</p>}
                {image.artistLink && (
                  <p>
                    <strong>🔗 Commissions:</strong>{' '}
                    <a href={image.artistLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                      View Artist's Commissions
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bots Section ───

export default function BotsSection({ isLoaded, isActive, user, bots = [], data, saveData, showNotification }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [form, setForm] = useState({ icon: '🐀', name: '', description: '', servers: '', users: '', inviteLink: '', githubRepo: '', botFolder: '' });

  if (!isLoaded) {
    return (
      <section id="bots" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={3} />
      </section>
    );
  }

  const openAdd = () => {
    setEditIndex(null);
    setForm({ icon: '🐀', name: '', description: '', servers: '', users: '', inviteLink: '', githubRepo: '', botFolder: '' });
    setModalOpen(true);
  };

  const openEdit = (index) => {
    const bot = bots[index];
    setEditIndex(index);
    setForm({
      icon: bot.icon || '🐀',
      name: bot.name || '',
      description: bot.description || '',
      servers: bot.servers || '',
      users: bot.users || '',
      inviteLink: bot.inviteLink || bot.invite || '',
      githubRepo: bot.githubRepo || '',
      botFolder: bot.botFolder || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const botData = { ...form };
    let updatedBots;
    if (editIndex !== null) {
      updatedBots = bots.map((b, i) => i === editIndex ? botData : b);
    } else {
      updatedBots = [...bots, botData];
    }
    const updated = { ...data, bots: updatedBots };
    const ok = await saveData(updated);
    showNotification(ok ? (editIndex !== null ? '✅ Bot updated!' : '🐀 Bot added!') : '❌ Failed to save', ok ? 'success' : 'error');
    setModalOpen(false);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    const updated = { ...data, bots: bots.filter((_, i) => i !== deleteIndex) };
    const ok = await saveData(updated);
    showNotification(ok ? '🗑️ Bot removed' : '❌ Failed to remove bot', ok ? 'success' : 'error');
    setConfirmOpen(false);
    setModalOpen(false);
  };

  const hasLinks = (bot) => bot.inviteLink || bot.invite || bot.githubRepo || bot.botFolder;

  return (
    <section id="bots" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 Discord Bots</h2>
        <div className="bots-grid">
          {user.isLoggedIn ? (
            bots.length > 0 ? (
              bots.map((bot, index) => (
                <div key={bot.id || index} className="bot-card" onClick={user.role === 'owner' ? () => openEdit(index) : undefined} style={user.role === 'owner' ? { cursor: 'pointer' } : undefined}>
                  <div className="bot-icon">{bot.icon || '🐀'}</div>
                  <h3 className="bot-name">{bot.name}</h3>
                  {bot.description && <p className="bot-description">{bot.description}</p>}
                  {(bot.servers || bot.users) && (
                    <div className="bot-stats">
                      {bot.servers && <span className="stat"><strong>{bot.servers}</strong> Servers</span>}
                      {bot.users && <span className="stat"><strong>{bot.users}</strong> Users</span>}
                    </div>
                  )}
                  {hasLinks(bot) && (
                    <div className="bot-links" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {(bot.inviteLink || bot.invite) && (
                        <a href={bot.inviteLink || bot.invite} className="bot-link-btn" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">✉️ Invite</a>
                      )}
                      {bot.githubRepo && (
                        <a href={bot.githubRepo} className="bot-link-btn bot-link-github" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">GitHub</a>
                      )}
                      {bot.botFolder && (
                        <a href={bot.botFolder} className="bot-link-btn" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">📁 Files</a>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="gallery-placeholder" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐀</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>No Bots Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Nothing to see here... yet!</p>
              </div>
            )
          ) : (
            <LoginPlaceholder message="To see bots, please login with the guest credentials" />
          )}
        </div>
        {user.role === 'owner' && (
          <button className="add-btn owner-only enabled" onClick={openAdd}>🐀 Add Bot</button>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editIndex !== null ? '🐀 Edit Bot' : '🐀 Add Bot'}>
        <label>Bot Icon (emoji)</label>
        <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🐀" />
        <label>Bot Name</label>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Bot" />
        <label>Description</label>
        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does your bot do?" />
        <label>Servers Count (optional)</label>
        <input type="text" value={form.servers} onChange={(e) => setForm({ ...form, servers: e.target.value })} placeholder="1.2K" />
        <label>Users Count (optional)</label>
        <input type="text" value={form.users} onChange={(e) => setForm({ ...form, users: e.target.value })} placeholder="50K" />
        <label>Invite Link (optional)</label>
        <input type="text" value={form.inviteLink} onChange={(e) => setForm({ ...form, inviteLink: e.target.value })} placeholder="https://discord.com/invite/..." />
        <label>GitHub Repository (optional)</label>
        <input type="text" value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} placeholder="https://github.com/sorynTech/my-bot" />
        <label>Bot Folder Path (optional)</label>
        <input type="text" value={form.botFolder} onChange={(e) => setForm({ ...form, botFolder: e.target.value })} placeholder="./bots/my-bot/" />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
          If you store bot files in the repo (e.g., /bots/discord-bot/)
        </p>
        <button onClick={handleSave}>Save Bot 🐀</button>
        {editIndex !== null && (
          <button onClick={() => confirmDelete(editIndex)} style={{ background: 'var(--accent-secondary)', marginTop: '0.5rem' }}>Delete 🐀</button>
        )}
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Bot" message="🐀 Delete this bot? This cannot be undone!" />
    </section>
  );
}

// ─── Projects Section ───

export function ProjectsSection({ isLoaded, isActive, user, projects = [], data, saveData, showNotification }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [form, setForm] = useState({ icon: '💻', name: '', description: '', githubRepo: '', liveDemo: '', projectFolder: '' });

  if (!isLoaded) {
    return (
      <section id="projects" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={3} />
      </section>
    );
  }

  const openAdd = () => {
    setEditIndex(null);
    setForm({ icon: '💻', name: '', description: '', githubRepo: '', liveDemo: '', projectFolder: '' });
    setModalOpen(true);
  };

  const openEdit = (index) => {
    const p = projects[index];
    setEditIndex(index);
    setForm({
      icon: p.icon || '💻',
      name: p.name || '',
      description: p.description || '',
      githubRepo: p.githubRepo || p.url || '',
      liveDemo: p.liveDemo || '',
      projectFolder: p.projectFolder || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const projectData = { ...form };
    let updatedProjects;
    if (editIndex !== null) {
      updatedProjects = projects.map((p, i) => i === editIndex ? projectData : p);
    } else {
      updatedProjects = [...projects, projectData];
    }
    const updated = { ...data, projects: updatedProjects };
    const ok = await saveData(updated);
    showNotification(ok ? (editIndex !== null ? '✅ Project updated!' : '🐀 Project added!') : '❌ Failed to save', ok ? 'success' : 'error');
    setModalOpen(false);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    const updated = { ...data, projects: projects.filter((_, i) => i !== deleteIndex) };
    const ok = await saveData(updated);
    showNotification(ok ? '🗑️ Project removed' : '❌ Failed to remove project', ok ? 'success' : 'error');
    setConfirmOpen(false);
    setModalOpen(false);
  };

  const hasLinks = (p) => p.githubRepo || p.url || p.liveDemo || p.projectFolder;

  return (
    <section id="projects" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 Coding Projects</h2>
        <div className="projects-grid">
          {user.isLoggedIn ? (
            projects.length > 0 ? (
              projects.map((project, index) => (
                <div key={project.id || index} className="project-card" onClick={user.role === 'owner' ? () => openEdit(index) : undefined} style={user.role === 'owner' ? { cursor: 'pointer' } : undefined}>
                  <div className="project-icon">{project.icon || '💻'}</div>
                  <h3 className="project-name">{project.name}</h3>
                  {project.description && <p className="project-description">{project.description}</p>}
                  {hasLinks(project) && (
                    <div className="project-links" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {(project.githubRepo || project.url) && (
                        <a href={project.githubRepo || project.url} className="project-link-btn" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">GitHub</a>
                      )}
                      {project.liveDemo && (
                        <a href={project.liveDemo} className="project-link-btn" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">🔗 Live Demo</a>
                      )}
                      {project.projectFolder && (
                        <a href={project.projectFolder} className="project-link-btn" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">📁 Files</a>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="gallery-placeholder" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐀</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>No Projects Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Nothing to see here... yet!</p>
              </div>
            )
          ) : (
            <LoginPlaceholder message="To see projects, please login with the guest credentials" />
          )}
        </div>
        {user.role === 'owner' && (
          <button className="add-btn owner-only enabled" onClick={openAdd}>🐀 Add Project</button>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editIndex !== null ? '🐀 Edit Project' : '🐀 Add Project'}>
        <label>Project Icon (emoji)</label>
        <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="💻" />
        <label>Project Name</label>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Project" />
        <label>Description</label>
        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does your project do?" />
        <label>GitHub Repository (optional)</label>
        <input type="text" value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} placeholder="https://github.com/sorynTech/my-project" />
        <label>Live Demo Link (optional)</label>
        <input type="text" value={form.liveDemo} onChange={(e) => setForm({ ...form, liveDemo: e.target.value })} placeholder="https://my-project.com" />
        <label>Project Folder Path (optional)</label>
        <input type="text" value={form.projectFolder} onChange={(e) => setForm({ ...form, projectFolder: e.target.value })} placeholder="./projects/my-project/" />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
          If you store project files in the repo (e.g., /projects/my-project/)
        </p>
        <button onClick={handleSave}>Save Project 🐀</button>
        {editIndex !== null && (
          <button onClick={() => confirmDelete(editIndex)} style={{ background: 'var(--accent-secondary)', marginTop: '0.5rem' }}>Delete 🐀</button>
        )}
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Project" message="🐀 Delete this project? This cannot be undone!" />
    </section>
  );
}

// ─── Art Gallery Section ───

export function ArtSection({ isLoaded, isActive, user, gallery = [], data, saveData, uploadImage, showNotification }) {
  const fileInputRef = useRef(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlForm, setUrlForm] = useState({ url: '', title: '', description: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [expandImage, setExpandImage] = useState(null);

  if (!isLoaded) {
    return (
      <section id="art" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={6} isGallery />
      </section>
    );
  }

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showNotification('⏳ Uploading image...', 'info');
    let currentGallery = [...gallery];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showNotification(`❌ ${file.name} is not an image`, 'error');
        continue;
      }
      const url = await uploadImage(file);
      if (url) {
        currentGallery = [...currentGallery, {
          src: url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded ${new Date().toLocaleDateString()}`,
          timestamp: Date.now(),
        }];
      }
    }
    await saveData({ ...data, gallery: currentGallery });
    showNotification('✅ Images uploaded!', 'success');
    e.target.value = '';
  };

  const openUrlModal = () => {
    setUrlForm({ url: '', title: '', description: '' });
    setUrlModalOpen(true);
  };

  const handleSaveUrl = async () => {
    if (!urlForm.url) return;
    const newItem = {
      src: urlForm.url,
      title: urlForm.title || `Artwork ${gallery.length + 1}`,
      description: urlForm.description,
      timestamp: Date.now(),
    };
    const updated = { ...data, gallery: [...gallery, newItem] };
    const ok = await saveData(updated);
    showNotification(ok ? '🔗 Image added!' : '❌ Failed to add image', ok ? 'success' : 'error');
    setUrlModalOpen(false);
  };

  const askClearGallery = () => {
    setConfirmTitle('Clear Gallery');
    setConfirmMsg('🐀 Clear the entire gallery? This cannot be undone!');
    setConfirmAction(() => async () => {
      const updated = { ...data, gallery: [] };
      const ok = await saveData(updated);
      showNotification(ok ? '🗑️ Gallery cleared' : '❌ Failed to clear gallery', ok ? 'success' : 'error');
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const askDeleteItem = (index) => {
    setConfirmTitle('Delete Image');
    setConfirmMsg('🐀 Delete this image from the gallery?');
    setConfirmAction(() => async () => {
      const updated = { ...data, gallery: gallery.filter((_, i) => i !== index) };
      const ok = await saveData(updated);
      showNotification(ok ? '🗑️ Image removed' : '❌ Failed to remove image', ok ? 'success' : 'error');
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  return (
    <section id="art" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🎨 Art Gallery</h2>
        <div className="gallery-controls">
          {user.role === 'owner' && (
            <>
              <input type="file" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="upload-btn owner-only enabled" onClick={handleUploadClick}>🎨 Upload from Device</button>
              <button className="upload-btn owner-only enabled" onClick={openUrlModal}>🔗 Add Image URL</button>
              <button className="clear-btn owner-only enabled" onClick={askClearGallery}>🗑️ Clear Gallery</button>
            </>
          )}
        </div>
        <div className="gallery-grid">
          {user.isLoggedIn ? (
            gallery.length > 0 ? (
              gallery.map((item, index) => (
                <div key={item.id || item.timestamp || index} className="gallery-item" onClick={() => setExpandImage(item)}>
                  <img src={item.url || item.src} alt={item.title || `Art ${index + 1}`} className="gallery-image" />
                  {user.role === 'owner' && (
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); askDeleteItem(index); }}>❌</button>
                  )}
                </div>
              ))
            ) : (
              <div className="gallery-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 60, height: 60 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>The rat&apos;s collection awaits...</p>
              </div>
            )
          ) : (
            <LoginPlaceholder message="To view the art gallery, please login with the guest credentials" />
          )}
        </div>
      </div>

      <Modal isOpen={urlModalOpen} onClose={() => setUrlModalOpen(false)} title="🎨 Add Image to Gallery">
        <label>Image URL</label>
        <input type="text" value={urlForm.url} onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })} placeholder="https://i.ibb.co/xxxxx/imagename.jpg" />
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(125, 211, 252, 0.1)', borderRadius: '10px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <strong>🖼️ Upload to ImgBB first:</strong><br />
            1. Go to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>imgbb.com</a><br />
            2. Upload your image<br />
            3. Copy the direct link<br />
            4. Paste it above
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            <strong>🖼️ Or use the Upload button to auto-upload!</strong>
          </p>
        </div>
        <label>Image Title (optional)</label>
        <input type="text" value={urlForm.title} onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })} placeholder="My Artwork" />
        <label>Image Description (optional)</label>
        <textarea rows="2" value={urlForm.description} onChange={(e) => setUrlForm({ ...urlForm, description: e.target.value })} placeholder="Description of the artwork" />
        <button onClick={handleSaveUrl}>Add to Gallery 🐀</button>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmAction} title={confirmTitle} message={confirmMsg} />
      <ImageExpandModal isOpen={!!expandImage} onClose={() => setExpandImage(null)} image={expandImage} />
    </section>
  );
}

// ─── Commissions Section ───

export function CommissionsSection({ isLoaded, isActive, user, commissions = [], data, saveData, uploadImage, showNotification }) {
  const fileInputRef = useRef(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlForm, setUrlForm] = useState({ url: '', title: '', description: '', artistName: '', artistLink: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [expandImage, setExpandImage] = useState(null);

  if (!isLoaded) {
    return (
      <section id="commissions" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={6} isGallery />
      </section>
    );
  }

  const canEdit = user.role === 'owner' || user.role === 'commission';

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showNotification('⏳ Uploading image...', 'info');
    let currentCommissions = [...commissions];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showNotification(`❌ ${file.name} is not an image`, 'error');
        continue;
      }
      const url = await uploadImage(file);
      if (url) {
        currentCommissions = [...currentCommissions, {
          src: url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded ${new Date().toLocaleDateString()}`,
          timestamp: Date.now(),
        }];
      }
    }
    await saveData({ ...data, commissions: currentCommissions });
    showNotification('✅ Commission images uploaded!', 'success');
    e.target.value = '';
  };

  const openUrlModal = () => {
    setUrlForm({ url: '', title: '', description: '', artistName: '', artistLink: '' });
    setUrlModalOpen(true);
  };

  const handleSaveUrl = async () => {
    if (!urlForm.url) return;
    const newItem = {
      src: urlForm.url,
      title: urlForm.title || `Commission ${commissions.length + 1}`,
      description: urlForm.description,
      artistName: urlForm.artistName,
      artistLink: urlForm.artistLink,
      timestamp: Date.now(),
    };
    const updated = { ...data, commissions: [...commissions, newItem] };
    const ok = await saveData(updated);
    showNotification(ok ? '🔗 Image added!' : '❌ Failed to add image', ok ? 'success' : 'error');
    setUrlModalOpen(false);
  };

  const askClearCommissions = () => {
    setConfirmTitle('Clear Gallery');
    setConfirmMsg('🎨 Clear the entire commission gallery? This cannot be undone!');
    setConfirmAction(() => async () => {
      const updated = { ...data, commissions: [] };
      const ok = await saveData(updated);
      showNotification(ok ? '🗑️ Commissions cleared' : '❌ Failed to clear commissions', ok ? 'success' : 'error');
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const askDeleteItem = (index) => {
    setConfirmTitle('Delete Commission');
    setConfirmMsg('🎨 Delete this commission from the gallery?');
    setConfirmAction(() => async () => {
      const updated = { ...data, commissions: commissions.filter((_, i) => i !== index) };
      const ok = await saveData(updated);
      showNotification(ok ? '🗑️ Image removed' : '❌ Failed to remove image', ok ? 'success' : 'error');
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  return (
    <section id="commissions" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🎨 Commission Gallery</h2>
        <div className="gallery-controls">
          {canEdit && (
            <>
              <input type="file" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="upload-btn commission-only enabled" onClick={handleUploadClick}>🎨 Upload from Device</button>
              <button className="upload-btn commission-only enabled" onClick={openUrlModal}>🔗 Add Image URL</button>
            </>
          )}
          {user.role === 'owner' && (
            <button className="clear-btn owner-only enabled" onClick={askClearCommissions}>🗑️ Clear Gallery</button>
          )}
        </div>
        <div className="gallery-grid">
          {user.isLoggedIn ? (
            commissions.length > 0 ? (
              commissions.map((item, index) => (
                <div key={item.id || item.timestamp || index} className="gallery-item" onClick={() => setExpandImage(item)}>
                  <img src={item.url || item.src} alt={item.title || `Commission ${index + 1}`} className="gallery-image" />
                  {canEdit && (
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); askDeleteItem(index); }}>❌</button>
                  )}
                </div>
              ))
            ) : (
              <div className="gallery-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 60, height: 60 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>Commissioned artwork will appear here...</p>
              </div>
            )
          ) : (
            <LoginPlaceholder message="To view commissioned artwork, please login with the guest credentials" />
          )}
        </div>
      </div>

      <Modal isOpen={urlModalOpen} onClose={() => setUrlModalOpen(false)} title="🎨 Add Commission Image">
        <label>Image URL</label>
        <input type="text" value={urlForm.url} onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })} placeholder="https://..." />
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(125, 211, 252, 0.1)', borderRadius: '10px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <strong>🎨 Supported Platforms:</strong>
          </p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '1.5rem' }}>
            <li>ImgBB - imgbb.com</li>
            <li>Catbox - catbox.moe</li>
            <li>PostImages - postimages.org</li>
            <li>Discord CDN - cdn.discordapp.com</li>
            <li>GitHub - raw.githubusercontent.com</li>
            <li>Any direct image URL</li>
          </ul>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            🖼️ Or use the <strong>Upload button</strong> to auto-upload to ImgBB!
          </p>
        </div>
        <label>Image Title (optional)</label>
        <input type="text" value={urlForm.title} onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })} placeholder="Commission Title" />
        <label>Image Description (optional)</label>
        <textarea rows="2" value={urlForm.description} onChange={(e) => setUrlForm({ ...urlForm, description: e.target.value })} placeholder="Client name, commission details..." />
        <label>Artist Name (optional)</label>
        <input type="text" value={urlForm.artistName} onChange={(e) => setUrlForm({ ...urlForm, artistName: e.target.value })} placeholder="Who drew this?" />
        <label>Artist Commissions Link (optional)</label>
        <input type="text" value={urlForm.artistLink} onChange={(e) => setUrlForm({ ...urlForm, artistLink: e.target.value })} placeholder="https://..." />
        <button onClick={handleSaveUrl}>Add to Gallery 🎨</button>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmAction} title={confirmTitle} message={confirmMsg} />
      <ImageExpandModal isOpen={!!expandImage} onClose={() => setExpandImage(null)} image={expandImage} />
    </section>
  );
}
