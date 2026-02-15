import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await onLogin(username, password);
    if (success) {
      onClose();
      setUsername('');
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>🐀 Rat&apos;s Nest Access</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Enter your credentials to access the nest
        </p>
        <div>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Enter the Nest 🐀</button>
          <div className="guest-credentials">
            <p className="credentials-label">Guest Access:</p>
            <p className="credentials-value">
              Username: Guest<br />Password: Rat_Guest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
