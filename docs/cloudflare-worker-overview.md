# Cloudflare Worker Overview

## Introduction

The SorynTech website uses a Cloudflare Worker as its backend API. This serverless solution provides fast, secure, and globally distributed API endpoints for authentication, data management, and third-party integrations.

## Architecture

```
┌─────────────────┐
│  GitHub Pages   │
│  (Frontend)     │
│  soryntech.me   │
└────────┬────────┘
         │
         │ HTTPS API Calls
         │
         ▼
┌─────────────────────┐
│ Cloudflare Worker   │
│   (Backend API)     │
│  soryntech-api      │
└────────┬────────────┘
         │
         ├─────► Supabase (Data Storage)
         ├─────► ImgBB (Image Uploads)
         └─────► GitHub API (Contributions)
```

## Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with 7-day token expiration
- **Role-based access control**: Owner, Guest, Commission
- **Secure password validation** with bcrypt-hashed credentials
- **Token verification** on protected endpoints

### 🌐 CORS Management
- **Origin validation** to prevent unauthorized access
- **Configurable allowed origins** via environment variables
- **Preflight request handling** for OPTIONS methods
- **Credential support** for authenticated requests

### 📊 Data Management
- **Supabase integration** for persistent data storage
- **Read/Write operations** with role-based permissions
- **Commission-specific updates** for limited access users
- **Atomic data operations** to prevent race conditions

### 🖼️ File Uploads
- **ImgBB integration** for image hosting
- **File type validation** (JPEG, PNG, GIF, WebP)
- **Size limits** (32MB max)
- **Secure upload flow** with authentication required

### 🐙 GitHub Integration
- **User profile fetching** via GitHub REST API
- **Contribution calendar** via GitHub GraphQL API
- **Rate limit handling** and error management
- **Username validation** to prevent injection attacks

### ⚠️ Error Handling
- **Custom 403 page** for forbidden access
- **Structured error responses** with helpful messages
- **Upstream error proxying** from third-party APIs
- **Detailed logging** for debugging

## Technology Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **JavaScript**: ES6+ with module imports
- **Authentication**: JWT (JSON Web Tokens) via `jose` library
- **APIs**: Supabase, ImgBB, GitHub REST & GraphQL
- **Deployment**: Wrangler CLI

## Performance

- **Edge Computing**: Requests handled at Cloudflare's edge locations worldwide
- **Low Latency**: Sub-100ms response times in most regions
- **Scalability**: Automatically scales with traffic
- **Reliability**: 99.99% uptime SLA from Cloudflare

## Security

- **Environment Variables**: Secrets stored securely in Cloudflare
- **No Credentials in Code**: All sensitive data in environment variables
- **Origin Validation**: Only allowed origins can access the API
- **JWT Verification**: All protected endpoints require valid tokens
- **Input Validation**: All user inputs are validated and sanitized

## Monitoring

- **Cloudflare Dashboard**: View real-time request analytics
- **Console Logging**: Error tracking and debugging
- **Worker Metrics**: CPU time, request count, error rates
- **Alerts**: Configure notifications for errors or high traffic

## Next Steps

- [Set up environment variables](./environment-variables.md)
- [Deploy your worker](./deployment-guide.md)
- [Configure CORS](./cors-configuration.md)
- [Explore API routes](./api-routes.md)
