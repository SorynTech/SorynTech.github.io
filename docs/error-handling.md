# Error Handling & Custom Error Pages

## Overview

The SorynTech Cloudflare Worker implements comprehensive error handling with custom error pages for a better user experience. This includes custom 403 (Forbidden) and 404 (Not Found) pages that match the site's theme.

## Error Response Strategy

### API Errors (JSON Responses)
When called from the frontend API, errors return JSON responses:

```javascript
{
  "error": "Error message",
  "status": 403
}
```

### Browser Errors (HTML Pages)
When accessed directly via browser or when appropriate, errors serve custom HTML pages with the site's theme.

## 403 Forbidden Errors

### What Triggers a 403?

1. **Invalid Origin**: Request comes from a non-allowed origin
2. **Insufficient Permissions**: User lacks required role for the operation
3. **Rate Limiting**: Too many requests (if implemented)
4. **Blocked Regions**: Geographic restrictions (if configured)

### 403 Response Flow

```
Request → Origin Check → Fail
                ↓
         Is Browser Request?
          ↙           ↘
        Yes            No
         ↓              ↓
   Serve 403.html   Return JSON Error
```

### Implementation in Worker

```javascript
// Check if request is from browser (has HTML Accept header)
function isBrowserRequest(request) {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

// Return 403 response
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
    <meta http-equiv="refresh" content="0; url=https://soryntech.me/403.html">
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
```

### Custom 403 Page Features

The `/403.html` page includes:

- **Rat Theme**: 🐀 Animated rat emoji with shake effect
- **Error Code**: Large "403" with gradient styling
- **Clear Message**: "The rat has blocked your access to this burrow"
- **Reason Box**: Explains why access was denied
- **Back Button**: Returns user to homepage
- **Floating Cheese**: Animated background matching site theme
- **Responsive Design**: Works on all device sizes

## 404 Not Found Errors

### What Triggers a 404?

1. **Invalid Route**: API endpoint doesn't exist
2. **Missing Resource**: Requested data not found

### 404 Response

```javascript
// Invalid routes return 404
if (!routeFound) {
  return jsonResponse({ error: 'Not Found' }, 404, env, origin);
}
```

## 500 Internal Server Errors

### What Triggers a 500?

1. **Uncaught Exceptions**: Unexpected errors in worker code
2. **Configuration Errors**: Missing required environment variables
3. **Upstream Failures**: Third-party API errors

### 500 Response

```javascript
try {
  // ... route handling
} catch (e) {
  console.error(e);
  return jsonResponse({ error: 'Internal Server Error' }, 500, env, origin);
}
```

## Worker Code Updates for 403 Routing

### Before (Old Code)
```javascript
if (!isAllowedOrigin(origin, env)) {
  return jsonResponse({ error: 'Forbidden' }, 403, env, origin);
}
```

### After (New Code with 403 Page Support)
```javascript
if (!isAllowedOrigin(origin, env)) {
  return handle403(request, env, origin);
}

// In role-based access checks
if (auth.role !== 'owner') {
  return handle403(request, env, origin);
}
```

### Complete 403 Handler Function

```javascript
/**
 * Handle 403 Forbidden errors with custom page support
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @param {string} origin - Request origin
 * @returns {Response} - 403 response (HTML or JSON)
 */
function handle403(request, env, origin) {
  const accept = request.headers.get('Accept') || '';
  const isBrowser = accept.includes('text/html');
  
  if (isBrowser) {
    // Serve the custom 403 HTML page
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Access Denied</title>
    <meta http-equiv="refresh" content="0; url=https://soryntech.me/403.html">
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
```

## Testing Error Responses

### Test 403 from Browser
```bash
# Visit worker URL directly (without valid origin)
curl -H "Accept: text/html" https://soryntech-api.your-subdomain.workers.dev/api/data
```

Expected: Redirect to custom 403 page

### Test 403 from API
```bash
# Make API call from disallowed origin
curl -H "Origin: https://unauthorized-site.com" \
     https://soryntech-api.your-subdomain.workers.dev/api/data
```

Expected: `{"error": "Forbidden"}` with 403 status

### Test Login with test403
```javascript
// In browser console on soryntech.me
// Open login modal, enter:
// Username: test403
// Password: anything

// Should redirect to /403.html
```

## Error Response Headers

All error responses include:

```
Access-Control-Allow-Origin: (allowed origin)
Content-Type: application/json (for JSON) or text/html (for HTML)
Cache-Control: no-cache (to prevent caching of errors)
```

## Best Practices

1. **Log All Errors**: Use `console.error()` for debugging
2. **Return Specific Messages**: Help users understand what went wrong
3. **Sanitize Error Details**: Don't expose sensitive information
4. **Consistent Format**: Use same structure for all JSON errors
5. **Provide Solutions**: Include suggestions in error messages
6. **Monitor Error Rates**: Track 403/404/500 in Cloudflare dashboard

## Error Message Guidelines

### Good Error Messages ✅
- "Access denied. Your origin is not authorized."
- "Insufficient permissions. Owner role required."
- "Rate limit exceeded. Try again in 60 seconds."

### Bad Error Messages ❌
- "Error" (too vague)
- "Forbidden" (no context)
- "Something went wrong" (not helpful)

## Future Enhancements

- **Custom 404 Page**: Similar to 403.html for not found errors
- **Rate Limiting**: Implement request throttling with 429 responses
- **Error Tracking**: Integrate with Sentry or similar service
- **Detailed Logs**: Enhanced logging for better debugging
- **Error Analytics**: Track common error patterns
