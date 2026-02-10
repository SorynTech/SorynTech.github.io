# SorynTech Cloudflare Worker Documentation

Welcome to the SorynTech Cloudflare Worker documentation. This directory contains comprehensive guides for deploying, configuring, and maintaining the Cloudflare Worker API that powers the SorynTech website.

## 📚 Documentation Contents

- **[Cloudflare Worker Overview](./cloudflare-worker-overview.md)** - Introduction to the Cloudflare Worker architecture
- **[API Routes](./api-routes.md)** - Complete API endpoint documentation
- **[Error Handling](./error-handling.md)** - 403, 404, and 500 error handling including custom error pages
- **[Environment Variables](./environment-variables.md)** - Configuration and secrets management
- **[Deployment Guide](./deployment-guide.md)** - Step-by-step deployment instructions
- **[CORS Configuration](./cors-configuration.md)** - Cross-Origin Resource Sharing setup

## 🚀 Quick Start

1. Install Wrangler CLI: `npm install -g wrangler`
2. Configure environment variables (see [Environment Variables](./environment-variables.md))
3. Deploy: `npm run deploy:worker`

## 🔗 Related Files

- **Source Code**: `/worker/src/index.js` - Main worker logic
- **Configuration**: `/wrangler.toml` - Worker configuration
- **Frontend**: `/script.js` - Client-side API integration
- **Error Pages**: `/403.html`, `/blocked.html` - Custom error pages

## 🐀 Support

For issues or questions, contact the SorynTech team or open an issue in the repository.
