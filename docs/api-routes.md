# API Routes Documentation

## Base URL

```
https://soryntech-api.your-subdomain.workers.dev
```

Or with custom domain:
```
https://api.soryntech.me
```

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Get a token by calling `/api/auth/login` with valid credentials.

## Routes Overview

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/health` | ❌ No | - | Health check |
| GET | `/api/credentials` | ❌ No | - | Get guest credentials |
| POST | `/api/auth/login` | ❌ No | - | Login and get JWT token |
| GET | `/api/auth/me` | ✅ Yes | Any | Verify token and get user info |
| GET | `/api/data` | ✅ Yes | Any | Get all data from Supabase |
| PUT | `/api/data` | ✅ Yes | Owner/Commission | Update data in Supabase |
| POST | `/api/upload` | ✅ Yes | Owner/Commission | Upload image to ImgBB |
| GET | `/api/github/user` | ❌ No | - | Get GitHub user profile |
| GET | `/api/github/contributions` | ❌ No | - | Get GitHub contribution calendar |

## Detailed Endpoint Documentation

### 🩺 Health Check

```http
GET /api/health
```

**Description**: Simple health check endpoint to verify the worker is running.

**Headers**: None required

**Response**:
```json
{
  "ok": true
}
```

**Status Codes**:
- `200 OK`: Worker is healthy

---

### 🔑 Get Guest Credentials

```http
GET /api/credentials
```

**Description**: Returns guest account credentials if `PUBLIC_GUEST_CREDENTIALS=true`.

**Headers**:
```
Origin: https://soryntech.me
```

**Response**:
```json
{
  "guestUser": "guest",
  "guestPass": "guest_password"
}
```

**Note**: Password only included if `PUBLIC_GUEST_CREDENTIALS` environment variable is set to `"true"`.

**Status Codes**:
- `200 OK`: Credentials returned
- `403 Forbidden`: Invalid origin

---

### 🔐 Login

```http
POST /api/auth/login
```

**Description**: Authenticate user and receive JWT token.

**Headers**:
```
Content-Type: application/json
Origin: https://soryntech.me
```

**Request Body**:
```json
{
  "username": "owner",
  "password": "your-password"
}
```

**Response** (Success):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "owner",
  "username": "owner"
}
```

**Response** (Error):
```json
{
  "error": "Invalid credentials"
}
```

**Roles**:
- `owner`: Full access to all operations
- `guest`: Read-only access
- `commission`: Can update commission data and upload images

**Status Codes**:
- `200 OK`: Login successful
- `400 Bad Request`: Missing username/password
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Invalid origin
- `500 Internal Server Error`: Configuration error

**Token Expiration**: 7 days

---

### 👤 Verify Token (Get Current User)

```http
GET /api/auth/me
```

**Description**: Verify JWT token and get current user information.

**Headers**:
```
Authorization: Bearer <jwt-token>
Origin: https://soryntech.me
```

**Response**:
```json
{
  "username": "owner",
  "role": "owner"
}
```

**Status Codes**:
- `200 OK`: Token valid
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Invalid origin

---

### 📊 Get Data

```http
GET /api/data
```

**Description**: Retrieve all data from Supabase storage.

**Authentication**: Required (any role)

**Headers**:
```
Authorization: Bearer <jwt-token>
Origin: https://soryntech.me
```

**Response**:
```json
{
  "profile": { ... },
  "commissions": [ ... ],
  "gallery": [ ... ],
  "bots": [ ... ]
}
```

**Status Codes**:
- `200 OK`: Data retrieved
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Invalid origin
- `500 Internal Server Error`: Configuration error
- `502 Bad Gateway`: Supabase error

---

### 💾 Update Data

```http
PUT /api/data
```

**Description**: Update data in Supabase storage.

**Authentication**: Required (Owner role for full update, Commission role for commission data only)

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
Origin: https://soryntech.me
```

**Request Body** (Owner - full update):
```json
{
  "profile": {
    "name": "SorynTech",
    "bio": "Backend Developer"
  },
  "commissions": [...],
  "gallery": [...],
  "bots": [...]
}
```

**Request Body** (Commission - partial update):
```json
{
  "commissions": [
    {
      "title": "Character Art",
      "price": 50,
      "status": "open"
    }
  ]
}
```

**Response**:
```json
{
  "ok": true
}
```

**Status Codes**:
- `200 OK`: Data updated
- `400 Bad Request`: Invalid JSON body
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions or invalid origin
- `500 Internal Server Error`: Configuration error
- `502 Bad Gateway`: Supabase error

**Notes**:
- Owner can update entire data object
- Commission role can only update `commissions` array
- Guest role cannot update data (403 response)

---

### 🖼️ Upload Image

```http
POST /api/upload
```

**Description**: Upload image to ImgBB and get URL.

**Authentication**: Required (Owner or Commission role)

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
Origin: https://soryntech.me
```

**Request Body** (FormData):
```
image: <file>
```

**Response**:
```json
{
  "url": "https://i.ibb.co/xxx/image.jpg"
}
```

**Constraints**:
- **Max Size**: 32 MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Authentication**: Owner or Commission role required

**Status Codes**:
- `200 OK`: Image uploaded
- `400 Bad Request`: Missing file or invalid format
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions or invalid origin
- `413 Payload Too Large`: File exceeds 32 MB
- `500 Internal Server Error`: Configuration error
- `502 Bad Gateway`: ImgBB error

**JavaScript Example**:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('https://api.soryntech.me/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('Image URL:', data.url);
```

---

### 🐙 Get GitHub User

```http
GET /api/github/user?username=<github-username>
```

**Description**: Fetch GitHub user profile information.

**Headers**:
```
Origin: https://soryntech.me
```

**Query Parameters**:
- `username` (required): GitHub username (1-39 chars, alphanumeric + hyphens)

**Response**:
```json
{
  "created_at": "2020-01-01T00:00:00Z",
  "login": "SorynTech",
  "name": "SorynTech"
}
```

**Status Codes**:
- `200 OK`: User found
- `400 Bad Request`: Missing or invalid username
- `403 Forbidden`: Invalid origin
- `404 Not Found`: User not found
- `500 Internal Server Error`: Configuration error

**Username Validation**:
- Length: 1-39 characters
- Pattern: Alphanumeric, hyphens allowed
- Cannot start/end with hyphen
- No consecutive hyphens

---

### 📊 Get GitHub Contributions

```http
GET /api/github/contributions?username=<github-username>
```

**Description**: Fetch GitHub contribution calendar for the last 52 weeks.

**Headers**:
```
Origin: https://soryntech.me
```

**Query Parameters**:
- `username` (required): GitHub username

**Response**:
```json
{
  "createdAt": "2020-01-01T00:00:00Z",
  "totalContributions": 1234,
  "weeks": [
    {
      "contributionDays": [
        {
          "date": "2024-01-01",
          "contributionCount": 5
        }
      ]
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Contributions retrieved
- `400 Bad Request`: Missing or invalid username
- `403 Forbidden`: Invalid origin
- `404 Not Found`: User not found
- `500 Internal Server Error`: Configuration error
- `502 Bad Gateway`: GitHub API error

**Data Includes**:
- Account creation date
- Total contributions (last 52 weeks)
- Weekly breakdown with daily contribution counts

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

### Common Error Messages

| Error | Status | Cause |
|-------|--------|-------|
| `"Forbidden"` | 403 | Invalid origin or insufficient permissions |
| `"Unauthorized"` | 401 | Missing or invalid JWT token |
| `"Not Found"` | 404 | Invalid route |
| `"Invalid request"` | 400 | Missing required fields |
| `"Invalid credentials"` | 401 | Wrong username/password |
| `"Server configuration error"` | 500 | Missing environment variables |
| `"Internal Server Error"` | 500 | Unexpected error |
| `"Upstream error"` | 502 | Third-party API failure |

## CORS

All responses include CORS headers:

```
Access-Control-Allow-Origin: <allowed-origin>
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

Allowed origins are configured in `ALLOWED_ORIGINS` environment variable.

## Rate Limiting

Currently, no rate limiting is enforced. Consider implementing rate limiting for production use.

## Examples

### JavaScript (Fetch API)

```javascript
// Login
const loginResponse = await fetch('https://api.soryntech.me/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'guest',
    password: 'guest_password'
  })
});
const { token } = await loginResponse.json();

// Get data
const dataResponse = await fetch('https://api.soryntech.me/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await dataResponse.json();
```

### cURL

```bash
# Login
TOKEN=$(curl -X POST https://api.soryntech.me/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://soryntech.me" \
  -d '{"username":"guest","password":"guest_password"}' \
  | jq -r '.token')

# Get data
curl https://api.soryntech.me/api/data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://soryntech.me"
```

## Testing

See [Testing Guide](./testing.md) for comprehensive API testing instructions.
