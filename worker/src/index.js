import { SignJWT, jwtVerify } from 'jose';
const IMGBB_UPLOAD = 'https://api.imgbb.com/1/upload';
const JWT_ISSUER = 'soryntech-api';
const JWT_AUDIENCE = 'soryntech-app';
const SITE_URL = 'https://soryntech.me';
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    if (method === 'OPTIONS') {
      return corsResponse(200, env);
    }
    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) {
      return handle403(request, env, origin);
    }
    try {
      if (url.pathname === '/api/health') {
        return jsonResponse({ ok: true }, 200, env, origin);
      }
      if (url.pathname === '/api/credentials' && method === 'GET') {
        return await handleGetCredentials(request, env, origin);
      }
      if (url.pathname === '/api/auth/login' && method === 'POST') {
        return await handleLogin(request, env, origin);
      }
      if (url.pathname === '/api/auth/me' && method === 'GET') {
        return await handleAuthMe(request, env, origin);
      }
      if (url.pathname === '/api/data' && method === 'GET') {
        return await handleDataGet(request, env, origin);
      }
      if (url.pathname === '/api/data' && method === 'PUT') {
        return await handleDataPut(request, env, origin);
      }
      if (url.pathname === '/api/upload' && method === 'POST') {
        return await handleUpload(request, env, origin);
      }
      if (url.pathname === '/api/github/user' && method === 'GET') {
        return await handleGitHubUser(request, env, origin);
      }
      if (url.pathname === '/api/github/contributions' && method === 'GET') {
        return await handleGitHubContributions(request, env, origin);
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
    if (entry.startsWith('.')) {
      const suffix = entry;
      const bare = entry.slice(1);
      return originHost === bare || (originHost.length > suffix.length && originHost.endsWith(suffix));
    }
    let allowedHost;
    try {
      allowedHost = entry.includes('://') ? new URL(entry).host : entry;
    } catch {
      return false;
    }
    return originHost === allowedHost;
  });
}
function handle403(request, env, origin) {
  const accept = request.headers.get('Accept') || '';
  const isBrowser = accept.includes('text/html');
  
  if (isBrowser) {
    // Serve a redirect to the custom 403 page
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Access Denied</title>
    <meta http-equiv="refresh" content="0; url=${SITE_URL}/403.html">
</head>
<body>
    <p>Redirecting to error page...</p>
</body>
</html>`, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });
  }
  
  // Return JSON for API calls
  return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
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
async function handleGetCredentials(request, env, origin) {
  const expose = env.PUBLIC_GUEST_CREDENTIALS === 'true';
  return jsonResponse({
    guestUser: env.GUEST_USERNAME || 'guest',
    ...(expose ? { guestPass: env.GUEST_PASSWORD || '' } : {})
  }, 200, env, origin);
}
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
    const commUser = env.COMM_USER || 'commission';
    const ownerPassword = env.OWNER_PASSWORD;
    const guestPassword = env.GUEST_PASSWORD;
    const commPassword = env.COMM_PASS;
    const missing = [];
    if (!ownerPassword) missing.push('OWNER_PASSWORD');
    if (!guestPassword) missing.push('GUEST_PASSWORD');
    if (!commPassword) missing.push('COMM_PASS');
    if (!env.JWT_SECRET) missing.push('JWT_SECRET');
    if (missing.length) {
      return jsonResponse(
        { error: 'Server configuration error', missing: missing },
        500,
        env,
        origin
      );
    }
    let role = null;
    if (username === ownerUser && password === ownerPassword) {
      role = 'owner';
    } else if (username === guestUser && password === guestPassword) {
      role = 'guest';
    } else if (username === commUser && password === commPassword) {
      role = 'commission';
    }
    if (!role) {
      return jsonResponse({ error: 'Invalid credentials' }, 401, env, origin);
    }
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
async function supabaseFetch(env, path) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) return null;
  return await res.json();
}
async function supabaseUpsert(env, table, rows) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) return null;
  return await res.json();
}
async function supabaseDelete(env, table, filter) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  return res.ok;
}
function profileToFrontend(row) {
  if (!row) return null;
  return {
    name: row.name,
    role: row.role,
    image: row.image,
    socials: {
      twitter: row.twitter,
      instagram: row.instagram,
      github: row.github,
      discord: row.discord,
      kofi: row.kofi,
    },
  };
}
function botToFrontend(row) {
  return {
    icon: row.icon,
    name: row.name,
    description: row.description,
    servers: row.servers,
    users: row.users,
    inviteLink: row.invite_link,
    githubRepo: row.github_repo,
    botFolder: row.bot_folder,
  };
}
function galleryToFrontend(row) {
  return { src: row.src, title: row.title, description: row.description, timestamp: row.timestamp };
}
function commissionToFrontend(row) {
  return { src: row.src, title: row.title, description: row.description, timestamp: row.timestamp };
}
function projectToFrontend(row) {
  return {
    icon: row.icon,
    name: row.name,
    description: row.description,
    githubRepo: row.github_repo,
    liveDemo: row.live_demo,
    projectFolder: row.project_folder,
  };
}
async function supabaseGetAll(env) {
  const [profileRows, botRows, galleryRows, commissionRows, projectRows] = await Promise.all([
    supabaseFetch(env, 'profile?select=*&id=eq.1'),
    supabaseFetch(env, 'bots?select=*&order=id'),
    supabaseFetch(env, 'gallery?select=*&order=id'),
    supabaseFetch(env, 'commissions?select=*&order=id'),
    supabaseFetch(env, 'projects?select=*&order=id'),
  ]);
  if (!profileRows || !botRows || !galleryRows || !commissionRows || !projectRows) return null;
  return {
    profile: profileRows.length > 0 ? profileToFrontend(profileRows[0]) : null,
    bots: botRows.map(botToFrontend),
    gallery: galleryRows.map(galleryToFrontend),
    commissions: commissionRows.map(commissionToFrontend),
    projects: projectRows.map(projectToFrontend),
  };
}
async function supabasePutAll(env, data) {
  // Update profile
  if (data.profile) {
    const p = data.profile;
    const profileRow = {
      id: 1,
      name: p.name || '',
      role: p.role || '',
      image: p.image || '',
      twitter: p.socials?.twitter || '',
      instagram: p.socials?.instagram || '',
      github: p.socials?.github || '',
      discord: p.socials?.discord || '',
      kofi: p.socials?.kofi || '',
    };
    const result = await supabaseUpsert(env, 'profile', profileRow);
    if (!result) return null;
  }
  // Sync bots: delete all then insert
  if (data.bots) {
    await supabaseDelete(env, 'bots', 'id=gt.0');
    if (data.bots.length > 0) {
      const botRows = data.bots.map((b) => ({
        icon: b.icon || '',
        name: b.name || '',
        description: b.description || '',
        servers: b.servers || '',
        users: b.users || '',
        invite_link: b.inviteLink || '',
        github_repo: b.githubRepo || '',
        bot_folder: b.botFolder || '',
      }));
      const result = await supabaseUpsert(env, 'bots', botRows);
      if (!result) return null;
    }
  }
  // Sync gallery
  if (data.gallery) {
    await supabaseDelete(env, 'gallery', 'id=gt.0');
    if (data.gallery.length > 0) {
      const rows = data.gallery.map((g) => ({
        src: g.src || '',
        title: g.title || '',
        description: g.description || '',
        timestamp: g.timestamp || Date.now(),
      }));
      const result = await supabaseUpsert(env, 'gallery', rows);
      if (!result) return null;
    }
  }
  // Sync commissions
  if (data.commissions) {
    await supabaseDelete(env, 'commissions', 'id=gt.0');
    if (data.commissions.length > 0) {
      const rows = data.commissions.map((c) => ({
        src: c.src || '',
        title: c.title || '',
        description: c.description || '',
        timestamp: c.timestamp || Date.now(),
      }));
      const result = await supabaseUpsert(env, 'commissions', rows);
      if (!result) return null;
    }
  }
  // Sync projects
  if (data.projects) {
    await supabaseDelete(env, 'projects', 'id=gt.0');
    if (data.projects.length > 0) {
      const rows = data.projects.map((p) => ({
        icon: p.icon || '',
        name: p.name || '',
        description: p.description || '',
        github_repo: p.githubRepo || '',
        live_demo: p.liveDemo || '',
        project_folder: p.projectFolder || '',
      }));
      const result = await supabaseUpsert(env, 'projects', rows);
      if (!result) return null;
    }
  }
  return await supabaseGetAll(env);
}
async function handleDataGet(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, env, origin);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }
  const data = await supabaseGetAll(env);
  if (data === null) {
    return jsonResponse({ error: 'Failed to read data' }, 502, env, origin);
  }
  return jsonResponse(data, 200, env, origin);
}
async function handleDataPut(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, env, origin);
  }
  if (auth.role === 'commission') {
    return await handleCommissionUpdate(request, env, origin);
  }
  if (auth.role !== 'owner') {
    return handle403(request, env, origin);
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
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }
  const result = await supabasePut(env, body);
  if (result === null) {
    return jsonResponse({ error: 'Failed to save data' }, 502, env, origin);
  }
  return jsonResponse(result ?? { ok: true }, 200, env, origin);
}
async function handleCommissionUpdate(request, env, origin) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Server configuration error' }, 500, env, origin);
  }
  const record = await supabaseGet(env);
  if (record === null) {
    return jsonResponse({ error: 'Failed to read data' }, 502, env, origin);
  }
  let newData;
  try {
    newData = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, env, origin);
  }
  if (!newData.commissions || !Array.isArray(newData.commissions)) {
    return jsonResponse({ error: 'Invalid commission data' }, 400, env, origin);
  }
  record.commissions = newData.commissions;
  const result = await supabasePut(env, record);
  if (result === null) {
    return jsonResponse({ error: 'Failed to save' }, 502, env, origin);
  }
  return jsonResponse(result ?? { ok: true }, 200, env, origin);
}
async function handleUpload(request, env, origin) {
  const auth = await getAuth(request, env);
  if (!auth || (auth.role !== 'owner' && auth.role !== 'commission')) {
    return handle403(request, env, origin);
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
  const maxSize = 32 * 1024 * 1024;
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
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

function isValidGitHubUsername(name) {
  return typeof name === 'string' && name.length >= 1 && name.length <= 39 && GITHUB_USERNAME_RE.test(name);
}

async function handleGitHubUser(request, env, origin) {
  const key = env.GITHUB_API_KEY;
  if (!key) {
    return jsonResponse({ error: 'GitHub API key not configured' }, 500, env, origin);
  }
  
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) {
    return jsonResponse({ error: 'Username required' }, 400, env, origin);
  }
  if (!isValidGitHubUsername(username)) {
    return jsonResponse({ error: 'Invalid username. Only letters, numbers, and hyphens allowed (max 39 chars).' }, 400, env, origin);
  }
  
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'Authorization': `token ${key}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SorynTech-Portfolio'
      }
    });
    
    if (!response.ok) {
      return jsonResponse({ error: 'GitHub API error', status: response.status }, response.status, env, origin);
    }
    
    const userData = await response.json();
    return jsonResponse({ 
      created_at: userData.created_at,
      login: userData.login,
      name: userData.name
    }, 200, env, origin);
  } catch (error) {
    console.error('GitHub API error:', error);
    return jsonResponse({ error: 'Failed to fetch GitHub data' }, 500, env, origin);
  }
}

async function handleGitHubContributions(request, env, origin) {
  const key = env.GITHUB_API_KEY;
  if (!key) {
    return jsonResponse({ error: 'GitHub API key not configured' }, 500, env, origin);
  }

  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) {
    return jsonResponse({ error: 'Username required' }, 400, env, origin);
  }
  if (!isValidGitHubUsername(username)) {
    return jsonResponse({ error: 'Invalid username. Only letters, numbers, and hyphens allowed (max 39 chars).' }, 400, env, origin);
  }

  // Build date range: last ~52 weeks up to now
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 52 * 7);
  const fromISO = from.toISOString();
  const toISO = now.toISOString();

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        createdAt
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${key}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SorynTech-Portfolio'
      },
      body: JSON.stringify({
        query,
        variables: { username, from: fromISO, to: toISO }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('GitHub GraphQL HTTP error:', response.status, text);
      return jsonResponse({ error: 'GitHub API error', status: response.status }, response.status, env, origin);
    }

    const json = await response.json();

    if (json.errors) {
      console.error('GitHub GraphQL errors:', JSON.stringify(json.errors));
      return jsonResponse({ error: 'GitHub GraphQL error', details: json.errors[0]?.message }, 502, env, origin);
    }

    const user = json.data?.user;
    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404, env, origin);
    }

    const calendar = user.contributionsCollection.contributionCalendar;
    return jsonResponse({
      createdAt: user.createdAt,
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks
    }, 200, env, origin);
  } catch (error) {
    console.error('GitHub contributions error:', error);
    return jsonResponse({ error: 'Failed to fetch contribution data' }, 500, env, origin);
  }
}