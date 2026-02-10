# Deployment Guide

## Prerequisites

Before deploying the SorynTech Cloudflare Worker, ensure you have:

- ✅ Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ All required API keys and secrets
- ✅ Git repository cloned locally

## Installation

### 1. Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for Workers.

```bash
# Global installation (recommended)
npm install -g wrangler

# Or use npx (no installation required)
npx wrangler --version
```

Verify installation:
```bash
wrangler --version
# Should show: ⛅️ wrangler 3.x.x
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This opens your browser to authenticate. Follow the prompts to grant access.

Verify authentication:
```bash
wrangler whoami
```

## Configuration

### 1. Review wrangler.toml

Check the configuration at `/wrangler.toml`:

```toml
name = "soryntech-api"
main = "worker/src/index.js"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGINS = "https://soryntech.me"
```

### 2. Set Environment Secrets

Set all required secrets (see [Environment Variables](./environment-variables.md)):

```bash
# Required secrets
wrangler secret put JWT_SECRET
wrangler secret put OWNER_PASSWORD
wrangler secret put GUEST_PASSWORD
wrangler secret put COMM_PASS
wrangler secret put JSONBIN_API_KEY
wrangler secret put JSONBIN_BIN_ID
wrangler secret put IMGBB_API_KEY
wrangler secret put GITHUB_API_KEY
```

Each command will prompt you to enter the secret value.

### 3. Verify Configuration

List your secrets (names only, values are hidden):
```bash
wrangler secret list
```

## Deployment

### Deploy from Repository Root

The project is configured to deploy from the repository root:

```bash
# Navigate to repository root
cd /path/to/SorynTech.github.io

# Deploy using npm script
npm run deploy:worker

# Or use wrangler directly
wrangler deploy
```

Expected output:
```
⛅️ wrangler 3.x.x
-------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded soryntech-api (x.xx sec)
Published soryntech-api (x.xx sec)
  https://soryntech-api.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Deploy from Worker Directory

Alternatively, deploy from the worker subdirectory:

```bash
cd worker
npx wrangler deploy
```

## Post-Deployment

### 1. Test Health Endpoint

```bash
curl https://soryntech-api.your-subdomain.workers.dev/api/health
```

Expected response:
```json
{"ok":true}
```

### 2. Test Authentication

```bash
curl -X POST https://soryntech-api.your-subdomain.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://soryntech.me" \
  -d '{"username":"guest","password":"YOUR_GUEST_PASSWORD"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "guest",
  "username": "guest"
}
```

### 3. Update Frontend Configuration

Update your frontend's API URL in `index.html` or `script.js`:

```html
<!-- In index.html -->
<div id="app-config" 
     data-api-url="https://soryntech-api.your-subdomain.workers.dev"
     style="display:none;">
</div>
```

Or in `script.js`:
```javascript
const CONFIG = {
  API_BASE_URL: 'https://soryntech-api.your-subdomain.workers.dev'
};
```

### 4. Configure Custom Domain (Optional)

#### Via Cloudflare Dashboard:

1. Go to **Workers & Pages** → **soryntech-api**
2. Click **Triggers** tab
3. Under **Custom Domains**, click **Add Custom Domain**
4. Enter your domain (e.g., `api.soryntech.me`)
5. Cloudflare automatically adds DNS records

#### Via Wrangler:

```bash
wrangler domains add api.soryntech.me
```

Update CORS in `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me,https://www.soryntech.me"
```

Redeploy:
```bash
wrangler deploy
```

## Monitoring

### Real-Time Logs

Stream live logs from your worker:

```bash
wrangler tail
```

Make requests and watch the logs in real-time.

Filter logs:
```bash
# Only show errors
wrangler tail --status error

# Search for specific text
wrangler tail --search "Forbidden"
```

### Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **soryntech-api**
3. View metrics:
   - **Requests**: Total request count
   - **Errors**: Error rate
   - **CPU Time**: Execution time
   - **Bandwidth**: Data transferred

### Analytics

Access detailed analytics:
```bash
wrangler analytics
```

## Updating the Worker

### Code Changes

After modifying `worker/src/index.js`:

```bash
# Test locally (if using miniflare)
npm run dev

# Deploy changes
npm run deploy:worker
```

### Configuration Changes

After modifying `wrangler.toml`:

```bash
wrangler deploy
```

### Secret Updates

Update a secret:
```bash
wrangler secret put SECRET_NAME
```

Delete a secret:
```bash
wrangler secret delete SECRET_NAME
```

## Rollback

### To Previous Version

```bash
# List recent deployments
wrangler deployments list

# Rollback to specific deployment
wrangler rollback [deployment-id]
```

### Manual Rollback

If needed, redeploy a previous git commit:

```bash
# Checkout previous version
git checkout <commit-hash>

# Deploy
wrangler deploy

# Return to latest
git checkout main
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-worker.yml`:

```yaml
name: Deploy Worker

on:
  push:
    branches:
      - main
    paths:
      - 'worker/**'
      - 'wrangler.toml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Set `CLOUDFLARE_API_TOKEN` in GitHub repository secrets.

## Troubleshooting

### "Worker not found" Error

**Cause**: Worker name mismatch  
**Solution**: Check `wrangler.toml` name matches deployed worker

### "Unauthorized" Error

**Cause**: Not logged in or token expired  
**Solution**: Re-authenticate
```bash
wrangler logout
wrangler login
```

### "Upload failed" Error

**Cause**: Network issues or file size limit  
**Solution**: Check internet connection, reduce bundle size

### "Configuration error" in Production

**Cause**: Missing secrets  
**Solution**: Verify all secrets are set
```bash
wrangler secret list
```

### CORS Errors in Frontend

**Cause**: ALLOWED_ORIGINS misconfigured  
**Solution**: Update `wrangler.toml` and redeploy
```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.me"
```

### 403 Errors for All Requests

**Cause**: Origin validation failing  
**Solution**: Check `Origin` header in requests matches `ALLOWED_ORIGINS`

## Development Workflow

### Local Development

```bash
# Start local dev server
wrangler dev

# Or use miniflare
npm install -D miniflare
miniflare worker/src/index.js --watch
```

### Testing Before Deploy

```bash
# Deploy to a preview environment
wrangler deploy --env staging

# Test staging URL
curl https://soryntech-api-staging.your-subdomain.workers.dev/api/health

# If successful, deploy to production
wrangler deploy
```

## Best Practices

1. **Version Control**: Always commit changes before deploying
2. **Test Locally**: Use `wrangler dev` for local testing
3. **Incremental Deploys**: Deploy small changes frequently
4. **Monitor Logs**: Use `wrangler tail` during deployment
5. **Backup Secrets**: Store secrets securely (password manager)
6. **Use Environments**: Separate dev/staging/prod deployments
7. **Document Changes**: Keep deployment log in CHANGELOG.md
8. **Review Analytics**: Monitor performance and errors regularly

## Quick Reference

```bash
# Deploy
npm run deploy:worker              # Deploy using npm script
wrangler deploy                    # Deploy directly

# Logs
wrangler tail                      # Stream live logs
wrangler tail --status error       # Filter errors only

# Secrets
wrangler secret list               # List secret names
wrangler secret put SECRET_NAME    # Add/update secret
wrangler secret delete SECRET_NAME # Remove secret

# Info
wrangler whoami                    # Check authentication
wrangler deployments list          # List recent deployments
wrangler analytics                 # View analytics

# Development
wrangler dev                       # Local development server
wrangler dev --remote              # Remote development (uses deployed worker)
```

## Support

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community Discord**: https://discord.gg/cloudflaredev
- **Status Page**: https://www.cloudflarestatus.com/

## Next Steps

- [Monitor your worker](https://dash.cloudflare.com/)
- [Explore API routes](./api-routes.md)
- [Configure error handling](./error-handling.md)
- [Set up CORS](./cors-configuration.md)
