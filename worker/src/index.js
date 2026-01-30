/**
 * SorynTech API – Cloudflare Worker (SIMPLIFIED - No Password Hashing)
 * Proxies JSONBin + ImgBB, JWT auth (owner/guest), CORS, validation.
 */
import { SignJWT, jwtVerify } from 'jose';

const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
const IMGBB_UPLOAD = 'https://api.imgbb.com/1/upload';
const JWT_ISSUER = 'soryntech-api';
const JWT_AUDIENCE = 'soryntech-app';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return corsResponse(200, env);
    }

    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) {
      return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
    }

    try {
      // Public: health
      if (url.pathname === '/api/health') {
        return jsonResponse({ ok: true }, 200, env, origin);
      }

      // Auth: login
      if (url.pathname === '/api/auth/login' && method === 'POST') {
        return await handleLogin(request, env, origin);
      }

      // Auth: me (validate token)
      if (url.pathname === '/api/auth/me' && method === 'GET') {
        return await handleAuthMe(request, env, origin);
      }

      // Data: GET (read) – allow guest or owner
      if (url.pathname === '/api/data' && method === 'GET') {
        return await handleDataGet(request, env, origin);
      }

      // Data: PUT (write) – owner only
      if (url.pathname === '/api/data' && method === 'PUT') {
        return await handleDataPut(request, env, origin);
      }

      // Upload: POST – owner only
      if (url.pathname === '/api/upload' && method === 'POST') {
        return await handleUpload(request, env, origin);
      }

      return jsonResponse({ error: 'Not Found' }, 404, env, origin);
    } catch (e) {
      console.error(e);
      return jsonResponse({ error: 'Internal Server Error' }, 500, env, origin);
    }
  },
};

function isAllowedOrigin(origin, env) {
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  if (!originHost) return false;

  const allowed = env.ALLOWED_ORIGINS || 'https://soryntech.github.io';
  const list = allowed.split(',').map((o) => o.trim()).filter(Boolean);
  if (list.length === 0) return true;

  return list.some((entry) => {
    // Dot-prefixed pattern: e.g. ".github.io" allows "github.io" and "*.github.io"
    if (entry.startsWith('.')) {
      const suffix = entry;
      const bare = entry.slice(1);
      return originHost === bare || (originHost.length > suffix.length && originHost.endsWith(suffix));
    }
    // Full URL or bare host: exact host match only
    let allowedHost;
    try {
      allowedHost = entry.includes('://') ? new URL(entry).host : entry;
    } catch {
      return false;
    }
    return originHost === allowedHost;
  });
}

function corsResponse(status, env) {
  const allowed = env.ALLOWED_ORIGINS || 'https://soryntech.github.io';
  const list = allowed.split(',').map((o) => o.trim()).filter(Boolean);
  const allowOrigin = list.length > 0 ? list[0] : '*';
  return new Response(null, {
    status,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonResponse(body, status, env, origin) {
  const allowed = env.ALLOWED_ORIGINS || 'https://soryntech.github.io';
  const list = allowed.split(',').map((o) => o.trim()).filter(Boolean);
  const allowOrigin = list.length > 0 && origin && list.some((o) => origin === o || origin.endsWith(o)) ? origin : (list[0] || '*');
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// SIMPLIFIED LOGIN - Direct password comparison (no hashing)
async function handleLogin(request, env, origin) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return jsonResponse({ error: 'Invalid request' }, 400, env, origin);
    }

    const ownerUser = env.OWNER_USERNAME || 'owner';
    const guestUser = env.GUEST_USERNAME || 'guest';
    const ownerPassword = env.OWNER_PASSWORD;
    const guestPassword = env.GUEST_PASSWORD;

    // Check for missing secrets
    const missing = [];
    if (!ownerPassword) missing.push('OWNER_PASSWORD');
    if (!guestPassword) missing.push('GUEST_PASSWORD');
    if (!env.JWT_SECRET) missing.push('JWT_SECRET');
    if (missing.length) {
      return jsonResponse(
        { error: 'Server configuration error', missing: missing },
        500,
        env,
        origin
      );
    }

    // Simple password comparison
    let role = null;
    if (username === ownerUser && password === ownerPassword) {
      role = 'owner';
    } else if (username === guestUser && password === guestPassword) {
      role = 'guest';
    }

    if (!role) {
      return jsonResponse({ error: 'Invalid credentials' }, 401, env, origin);
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({ sub: username, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime('7d')
      .sign(secret);

    return jsonResponse(
      { token, role, username },
      200,
      env,
      origin
    );
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Internal Server Error' }, 500, env, origin);
  }
}

async function getAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return { username: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

async function handleAuthMe(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, env, origin);
  }
  return jsonResponse({ username: auth.username, role: auth.role }, 200, env, origin);
}

async function handleDataGet(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, env, origin);
  }

  const binId = env.JSONBIN_BIN_ID;
  const apiKey = env.JSONBIN_API_KEY;
  if (!binId || !apiKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }

  const res = await fetch(`${JSONBIN_BASE}/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    return jsonResponse(
      { error: 'Upstream error', status: res.status },
      res.status >= 500 ? 502 : res.status,
      env,
      origin
    );
  }

  const data = await res.json();
  return jsonResponse(data.record ?? data, 200, env, origin);
}

async function handleDataPut(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth || auth.role !== 'owner') {
    return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, env, origin);
  }

  if (!body || typeof body !== 'object') {
    return jsonResponse({ error: 'Invalid body' }, 400, env, origin);
  }

  const binId = env.JSONBIN_BIN_ID;
  const apiKey = env.JSONBIN_API_KEY;
  if (!binId || !apiKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }

  const res = await fetch(`${JSONBIN_BASE}/b/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return jsonResponse(
      { error: 'Upstream error', status: res.status },
      res.status >= 500 ? 502 : res.status,
      env,
      origin
    );
  }

  const data = await res.json().catch(() => ({}));
  return jsonResponse(data.record ?? data ?? { ok: true }, 200, env, origin);
}

async function handleUpload(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth || auth.role !== 'owner') {
    return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
  }

  const apiKey = env.IMGBB_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ error: 'Expected multipart/form-data' }, 400, env, origin);
  }

  const formData = await request.formData();
  const image = formData.get('image');
  if (!image || !(image instanceof File)) {
    return jsonResponse({ error: 'Missing image file' }, 400, env, origin);
  }

  const maxSize = 32 * 1024 * 1024; // 32MB
  if (image.size > maxSize) {
    return jsonResponse({ error: 'File too large' }, 413, env, origin);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(image.type)) {
    return jsonResponse({ error: 'Invalid file type' }, 400, env, origin);
  }

  const uploadForm = new FormData();
  uploadForm.append('image', image);
  const uploadUrl = `${IMGBB_UPLOAD}?key=${apiKey}`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: uploadForm,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    return jsonResponse(
      { error: 'Upload failed', detail: data.error?.message || res.statusText },
      res.ok ? 502 : res.status,
      env,
      origin
    );
  }

  return jsonResponse({ url: data.data?.url || data.data?.display_url }, 200, env, origin);
}