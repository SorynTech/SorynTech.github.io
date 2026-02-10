# CORS Configuration

## Overview

Cross-Origin Resource Sharing (CORS) is configured to control which domains can access the SorynTech Cloudflare Worker API. This is a critical security feature that prevents unauthorized websites from making API calls.

## How CORS Works

```
┌──────────────────┐
│   Browser at     │
│ soryntech.me     │
└────────┬─────────┘
         │
         │ 1. Request with Origin header
         │    Origin: https://soryntech.me
         ▼
┌──────────────────┐
│  Cloudflare      │
│  Worker API      │
└────────┬─────────┘
         │
         │ 2. Check if origin is allowed
         │
         ▼
┌──────────────────┐
│ ALLOWED_ORIGINS  │
│ Environment Var  │
└────────┬─────────┘
         │
         │ 3. If allowed, add CORS headers
         │    Access-Control-Allow-Origin: https://soryntech.me
         ▼
┌──────────────────┐
│   Response       │
│   to Browser     │
└──────────────────┘
```

## Configuration

### Environment Variable

CORS is configured via the `ALLOWED_ORIGINS` variable in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me"
```

### Multiple Origins

To allow multiple origins, use comma-separated values:

```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me,https://www.soryntech.me,https://soryntech.github.io"
```

### Wildcard Subdomain

To allow all subdomains of a domain:

```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me,.soryntech.me"
```

This allows:
- ✅ `https://soryntech.me`
- ✅ `https://www.soryntech.me`
- ✅ `https://api.soryntech.me`
- ✅ `https://anything.soryntech.me`

## CORS Headers

### Preflight Requests (OPTIONS)

For complex requests (POST, PUT with custom headers), browsers send a preflight OPTIONS request:

**Request**:
```http
OPTIONS /api/auth/login HTTP/1.1
Host: api.soryntech.me
Origin: https://soryntech.me
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**Response**:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://soryntech.me
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Actual Requests

For actual API requests, the worker adds these headers:

```http
Access-Control-Allow-Origin: https://soryntech.me
Access-Control-Allow-Credentials: true
```

## Worker Implementation

### Origin Validation

```javascript
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
    // Handle wildcard subdomains (.example.com)
    if (entry.startsWith('.')) {
      const suffix = entry;
      const bare = entry.slice(1);
      return originHost === bare || 
             (originHost.length > suffix.length && 
              originHost.endsWith(suffix));
    }
    
    // Handle full URLs or hostnames
    let allowedHost;
    try {
      allowedHost = entry.includes('://') ? 
                    new URL(entry).host : entry;
    } catch {
      return false;
    }
    
    return originHost === allowedHost;
  });
}
```

### CORS Response Helper

```javascript
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
```

### JSON Response with CORS

```javascript
function jsonResponse(body, status, env, origin) {
  const allowed = env.ALLOWED_ORIGINS || 'https://soryntech.github.io';
  const list = allowed.split(',').map((o) => o.trim()).filter(Boolean);
  
  // Match specific origin if in allowed list
  const allowOrigin = list.length > 0 && origin && 
                      list.some((o) => origin === o || 
                                       origin.endsWith(o)) ? 
                      origin : (list[0] || '*');
  
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
```

## Testing CORS

### Test from Browser Console

On your allowed domain (e.g., `https://soryntech.me`):

```javascript
// Should succeed
fetch('https://api.soryntech.me/api/health')
  .then(r => r.json())
  .then(console.log);
```

On a disallowed domain:

```javascript
// Should fail with CORS error
fetch('https://api.soryntech.me/api/health')
  .then(r => r.json())
  .catch(console.error);
// Error: Blocked by CORS policy
```

### Test with cURL

```bash
# Request from allowed origin
curl -i https://api.soryntech.me/api/health \
  -H "Origin: https://soryntech.me"

# Should include:
# Access-Control-Allow-Origin: https://soryntech.me

# Request from disallowed origin
curl -i https://api.soryntech.me/api/health \
  -H "Origin: https://evil-site.com"

# Should return:
# {"error":"Forbidden"}
```

### Test Preflight Request

```bash
curl -i -X OPTIONS https://api.soryntech.me/api/auth/login \
  -H "Origin: https://soryntech.me" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Should return:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: https://soryntech.me
# Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
# Access-Control-Max-Age: 86400
```

## Common CORS Errors

### "No 'Access-Control-Allow-Origin' header"

**Browser Error**:
```
Access to fetch at 'https://api.soryntech.me/api/data' from origin 
'https://unauthorized-site.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Cause**: Your domain is not in `ALLOWED_ORIGINS`

**Solution**: Add your domain to `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me,https://authorized-site.com"
```

Then redeploy:
```bash
wrangler deploy
```

### "The 'Access-Control-Allow-Origin' header contains the invalid value"

**Cause**: Misconfigured CORS response

**Solution**: Ensure `ALLOWED_ORIGINS` contains valid URLs:
```toml
# Good ✅
ALLOWED_ORIGINS = "https://soryntech.me"

# Bad ❌
ALLOWED_ORIGINS = "soryntech.me"  # Missing protocol
```

### "Request header field Authorization is not allowed"

**Cause**: Authorization header not in allowed headers

**Solution**: Already included in worker. If issue persists, check browser cache or try hard refresh.

### Preflight Request Fails

**Cause**: OPTIONS request not handled

**Solution**: Worker already handles OPTIONS. If issue persists, check:
1. OPTIONS request is reaching worker (check logs: `wrangler tail`)
2. No proxy/firewall blocking OPTIONS
3. Browser not using cached preflight (try incognito mode)

## Security Best Practices

### ✅ Do's

1. **Whitelist Specific Domains**
   ```toml
   ALLOWED_ORIGINS = "https://soryntech.me,https://www.soryntech.me"
   ```

2. **Use HTTPS Only**
   ```toml
   # Good ✅
   ALLOWED_ORIGINS = "https://soryntech.me"
   
   # Bad ❌ (security risk)
   ALLOWED_ORIGINS = "http://soryntech.me"
   ```

3. **Limit to Production Domains**
   ```toml
   # Production
   ALLOWED_ORIGINS = "https://soryntech.me"
   
   # Development (separate worker)
   ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:8000"
   ```

4. **Log Blocked Origins**
   ```javascript
   if (!isAllowedOrigin(origin, env)) {
     console.warn('Blocked origin:', origin);
     return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
   }
   ```

### ❌ Don'ts

1. **Don't Use Wildcard in Production**
   ```toml
   # Dangerous! ❌
   ALLOWED_ORIGINS = "*"
   ```

2. **Don't Allow HTTP in Production**
   ```toml
   # Insecure! ❌
   ALLOWED_ORIGINS = "http://soryntech.me"
   ```

3. **Don't Expose Internal URLs**
   ```toml
   # Bad! ❌
   ALLOWED_ORIGINS = "https://internal-admin.company.com"
   ```

4. **Don't Trust Referer Header**
   ```javascript
   // Bad! ❌
   const referer = request.headers.get('Referer');
   if (referer.includes('soryntech.me')) { ... }
   
   // Good! ✅
   const origin = request.headers.get('Origin');
   if (isAllowedOrigin(origin, env)) { ... }
   ```

## Development vs Production

### Local Development

For local testing, use separate worker with localhost allowed:

**wrangler.dev.toml**:
```toml
name = "soryntech-api-dev"
main = "worker/src/index.js"

[vars]
ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000"
```

Deploy dev worker:
```bash
wrangler deploy --config wrangler.dev.toml
```

### Production

**wrangler.toml**:
```toml
name = "soryntech-api"
main = "worker/src/index.js"

[vars]
ALLOWED_ORIGINS = "https://soryntech.me"
```

Deploy production:
```bash
wrangler deploy
```

## Advanced Patterns

### Environment-Specific Origins

```toml
[env.production]
vars = { ALLOWED_ORIGINS = "https://soryntech.me" }

[env.staging]
vars = { ALLOWED_ORIGINS = "https://staging.soryntech.me" }

[env.development]
vars = { ALLOWED_ORIGINS = "http://localhost:3000" }
```

### Dynamic Origin Validation

For more complex rules, modify `isAllowedOrigin()`:

```javascript
function isAllowedOrigin(origin, env) {
  // Allow all *.soryntech.me subdomains
  const originHost = new URL(origin).host;
  if (originHost.endsWith('.soryntech.me') || 
      originHost === 'soryntech.me') {
    return true;
  }
  
  // Check explicit allowlist
  const allowed = env.ALLOWED_ORIGINS || '';
  return allowed.split(',').some(o => 
    o.trim() === origin
  );
}
```

## Monitoring CORS

### Log All Requests

```javascript
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = isAllowedOrigin(origin, env);
    
    console.log({
      timestamp: new Date().toISOString(),
      origin,
      allowed,
      method: request.method,
      url: request.url
    });
    
    // ... rest of handler
  }
};
```

### Track Blocked Requests

Use Cloudflare Analytics to monitor 403 responses:

```bash
wrangler tail --status error
```

## Troubleshooting Checklist

- [ ] Is `ALLOWED_ORIGINS` set in `wrangler.toml`?
- [ ] Does it include the protocol (https://)?
- [ ] Is the domain spelled correctly?
- [ ] Did you redeploy after changing `wrangler.toml`?
- [ ] Is the request coming from the correct domain?
- [ ] Check browser console for specific CORS error
- [ ] Check worker logs: `wrangler tail`
- [ ] Try in incognito mode (clear cache)
- [ ] Test with cURL to isolate browser issues

## Reference

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Cloudflare Workers: CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [CORS Errors Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors)
