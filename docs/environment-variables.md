# Environment Variables & Secrets

## Overview

The SorynTech Cloudflare Worker requires several environment variables and secrets to function properly. These are configured through the Cloudflare dashboard or Wrangler CLI.

## Configuration Types

### 1. Public Variables (`[vars]` in wrangler.toml)
Non-sensitive configuration that can be committed to git.

### 2. Secret Variables (Dashboard or `wrangler secret`)
Sensitive credentials that should never be committed to git.

## Required Secrets

All secrets should be set using Wrangler CLI or Cloudflare Dashboard.

### JWT_SECRET
**Purpose**: Signs and verifies JWT authentication tokens  
**Type**: Secret (required)  
**Example**: `your-super-secret-jwt-key-min-32-chars`  
**How to Set**:
```bash
wrangler secret put JWT_SECRET
# Enter your secret when prompted
```

### OWNER_PASSWORD
**Purpose**: Password for the owner account (full admin access)  
**Type**: Secret (required)  
**Format**: Bcrypt hash recommended (plain text supported)  
**How to Set**:
```bash
wrangler secret put OWNER_PASSWORD
```

### GUEST_PASSWORD
**Purpose**: Password for guest account (read-only access)  
**Type**: Secret (required)  
**Format**: Plain text or bcrypt hash  
**How to Set**:
```bash
wrangler secret put GUEST_PASSWORD
```

### COMM_PASS
**Purpose**: Password for commission account (limited write access)  
**Type**: Secret (required)  
**Format**: Plain text or bcrypt hash  
**How to Set**:
```bash
wrangler secret put COMM_PASS
```

### SUPABASE_URL
**Purpose**: Supabase project URL for data storage  
**Type**: Secret (required)  
**Format**: `https://<project-ref>.supabase.co`  
**Get URL**: https://supabase.com/dashboard → Settings → API  
**How to Set**:
```bash
wrangler secret put SUPABASE_URL
```

### SUPABASE_ANON_KEY
**Purpose**: Supabase anon/public API key  
**Type**: Secret (required)  
**Get Key**: https://supabase.com/dashboard → Settings → API  
**How to Set**:
```bash
wrangler secret put SUPABASE_ANON_KEY
```

### SUPABASE_SERVICE_ROLE_KEY
**Purpose**: Supabase service role key (full database access, bypasses RLS)  
**Type**: Secret (required)  
**Get Key**: https://supabase.com/dashboard → Settings → API  
**How to Set**:
```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### IMGBB_API_KEY
**Purpose**: API key for ImgBB image uploads  
**Type**: Secret (required)  
**Get Key**: https://api.imgbb.com/  
**How to Set**:
```bash
wrangler secret put IMGBB_API_KEY
```

### GITHUB_API_KEY
**Purpose**: GitHub Personal Access Token for API calls  
**Type**: Secret (required)  
**Scopes Needed**: `read:user`, `repo` (for contributions)  
**Get Token**: https://github.com/settings/tokens  
**How to Set**:
```bash
wrangler secret put GITHUB_API_KEY
```

## Public Configuration Variables

These are set in `wrangler.toml` under `[vars]`:

### ALLOWED_ORIGINS
**Purpose**: Comma-separated list of allowed CORS origins  
**Type**: Public variable  
**Default**: `"https://soryntech.me"`  
**Example**: `"https://soryntech.me,https://soryntech.github.io"`  
**Location**: `wrangler.toml`
```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me"
```

### OWNER_USERNAME
**Purpose**: Username for owner account  
**Type**: Public variable (optional)  
**Default**: `"owner"`  
**Location**: `wrangler.toml`

### GUEST_USERNAME
**Purpose**: Username for guest account  
**Type**: Public variable (optional)  
**Default**: `"guest"`  
**Location**: `wrangler.toml`

### COMM_USER
**Purpose**: Username for commission account  
**Type**: Public variable (optional)  
**Default**: `"commission"`  
**Location**: `wrangler.toml`

### PUBLIC_GUEST_CREDENTIALS
**Purpose**: Whether to expose guest credentials via API  
**Type**: Public variable (optional)  
**Values**: `"true"` or `"false"`  
**Default**: `false`  
**Location**: `wrangler.toml`

## Setting Up Secrets

### Method 1: Wrangler CLI (Recommended)

```bash
# Navigate to project root
cd /path/to/SorynTech.github.io

# Set each secret interactively
wrangler secret put JWT_SECRET
wrangler secret put OWNER_PASSWORD
wrangler secret put GUEST_PASSWORD
wrangler secret put COMM_PASS
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put IMGBB_API_KEY
wrangler secret put GITHUB_API_KEY
```

### Method 2: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Select your worker (`soryntech-api`)
4. Go to **Settings** → **Variables**
5. Add each secret under **Environment Variables**
6. Click **Encrypt** for sensitive values

### Method 3: Bulk Upload via Script

Create a `.env` file (⚠️ DO NOT COMMIT):
```bash
JWT_SECRET=your-secret-here
OWNER_PASSWORD=your-password-here
GUEST_PASSWORD=your-password-here
COMM_PASS=your-password-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
IMGBB_API_KEY=your-key-here
GITHUB_API_KEY=your-token-here
```

Then run:
```bash
# Read from .env and set all secrets
while IFS='=' read -r key value; do
  echo "$value" | wrangler secret put "$key"
done < .env
```

## Verifying Configuration

### Check Public Variables
```bash
wrangler tail
# Make a request and check logs for configuration errors
```

### Check Secret Variables
```bash
# Secrets can't be viewed directly (security feature)
# Test by making API calls:

# Test authentication
curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"guest","password":"your-guest-password"}'

# Test data access
curl https://your-worker.workers.dev/api/data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Best Practices

### ✅ Do's
- ✅ Use strong, random secrets (min 32 characters for JWT_SECRET)
- ✅ Rotate secrets periodically (every 90 days recommended)
- ✅ Use different passwords for each role
- ✅ Store secrets in password manager
- ✅ Use environment-specific secrets (dev/prod)
- ✅ Enable GitHub secret scanning
- ✅ Add `.env` to `.gitignore`

### ❌ Don'ts
- ❌ Never commit secrets to git
- ❌ Don't share secrets via email or chat
- ❌ Don't use weak or predictable passwords
- ❌ Don't reuse secrets across projects
- ❌ Don't log secrets to console
- ❌ Don't expose secrets in error messages
- ❌ Don't hardcode secrets in source code

## Troubleshooting

### "Server configuration error" Response
**Cause**: One or more required secrets are missing  
**Solution**: Check which secrets are missing in the error response and set them:
```json
{
  "error": "Server configuration error",
  "missing": ["JWT_SECRET", "OWNER_PASSWORD"]
}
```

### "Forbidden" Response
**Cause**: ALLOWED_ORIGINS doesn't match request origin  
**Solution**: Update `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me,https://your-domain.com"
```

### "Invalid credentials" Response
**Cause**: Username/password mismatch  
**Solution**: Verify secrets are set correctly:
```bash
# Reset password secret
wrangler secret put OWNER_PASSWORD
```

### Cannot Fetch GitHub Data
**Cause**: Invalid or missing GITHUB_API_KEY  
**Solution**: Generate new token with correct scopes and update:
```bash
wrangler secret put GITHUB_API_KEY
```

## Secret Rotation Procedure

When rotating secrets (recommended every 90 days):

1. **Generate New Secret**: Create new strong password/key
2. **Update Secret**: Use `wrangler secret put SECRETNAME`
3. **Test**: Verify worker still functions correctly
4. **Update Clients**: If changing JWT_SECRET, all users need to re-login
5. **Document**: Record rotation date and by whom

## Environment-Specific Configuration

For multiple environments (dev/staging/prod):

### Option 1: Multiple Workers
```bash
# wrangler.toml
[env.production]
name = "soryntech-api"
vars = { ALLOWED_ORIGINS = "https://soryntech.me" }

[env.staging]
name = "soryntech-api-staging"
vars = { ALLOWED_ORIGINS = "https://staging.soryntech.me" }
```

Deploy:
```bash
wrangler deploy --env production
wrangler deploy --env staging
```

### Option 2: Separate wrangler.toml Files
```
worker/
├── wrangler.production.toml
├── wrangler.staging.toml
└── src/index.js
```

Deploy:
```bash
wrangler deploy --config wrangler.production.toml
```

## Reference

- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Wrangler Secret Management](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [Supabase REST API](https://supabase.com/docs/guides/api)
- [ImgBB API Documentation](https://api.imgbb.com/)
- [GitHub API Authentication](https://docs.github.com/en/authentication)
