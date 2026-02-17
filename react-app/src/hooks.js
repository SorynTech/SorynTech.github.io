import React, { useState, useEffect, useCallback, useRef } from 'react';

const CONFIG = Object.freeze({
  API_BASE_URL: 'https://soryntech-api.zippydrawzstudioz.workers.dev',
});

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  if (token) localStorage.setItem('authToken', token);
  else localStorage.removeItem('authToken');
}

export function useAuth() {
  const [user, setUser] = useState({
    username: null,
    role: 'guest',
    isLoggedIn: false,
  });

  const checkAuthState = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          username: data.username,
          role: data.role || 'guest',
          isLoggedIn: true,
        });
      } else {
        setAuthToken(null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setUser({
          username: data.username || username,
          role: data.role || 'guest',
          isLoggedIn: true,
        });
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser({ username: null, role: 'guest', isLoggedIn: false });
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  return { user, login, logout, CONFIG };
}

export function useDataLoader(user) {
  const [data, setData] = useState({
    bots: [],
    profile: null,
    gallery: [],
    commissions: [],
    projects: [],
  });

  const loadData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setData({
          bots: result.bots || [],
          profile: result.profile || null,
          gallery: result.gallery || [],
          commissions: result.commissions || [],
          projects: result.projects || [],
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveData = useCallback(async (updatedData) => {
    const token = getAuthToken();
    if (!token) return false;
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        setData(updatedData);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }, []);

  const uploadImage = useCallback(async (file) => {
    const token = getAuthToken();
    if (!token) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        return result.url;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  useEffect(() => {
    if (user.isLoggedIn) {
      loadData();
    }
  }, [user.isLoggedIn, loadData]);

  return { data, setData, saveData, uploadImage, reloadData: loadData };
}

export function useNotification() {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const showNotification = useCallback((message, type = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ message, type });
    timerRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  return { notification, showNotification };
}

export function copyToClipboard(text, label, showNotification) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (showNotification) {
        showNotification(`📋 Copied ${label}: ${text}`, 'success');
      }
    })
    .catch(() => {
      if (showNotification) {
        showNotification('❌ Failed to copy', 'error');
      }
    });
}
