# GitHub Contribution Graph Feature

## Overview
This feature displays a **real** GitHub contribution graph on your portfolio website
by querying the GitHub GraphQL API through a Cloudflare Worker proxy.  If the API
key is missing or the request fails, the graph falls back to randomly-generated
demo data and shows a visible **"Demo / Sample Data"** banner so visitors know
the numbers are not real.

## Configuration

### GitHub API Key Setup

The graph uses GitHub's **GraphQL API** (`contributionsCollection` query) which
requires an authenticated token.

#### Token type

Either a **fine-grained PAT** or a **classic PAT** works.

| Token type | Required scopes |
|---|---|
| Fine-grained | **read-only** access to your **public profile** (no repo access needed) |
| Classic | `read:user` |

#### How to Create the Token

1. Go to **GitHub Settings → Developer Settings → Personal Access Tokens**
2. Choose *Fine-grained tokens* (recommended) or *Tokens (classic)*
3. Give it a name like "Portfolio Website"
4. For fine-grained: grant **read-only user profile** access.  For classic: check `read:user`.
5. Click **Generate token** and copy it immediately.

#### How to Configure the Token

Add the token as a Cloudflare Worker secret:

```bash
wrangler secret put GITHUB_API_KEY
```

Paste your token when prompted, then redeploy the Worker.

**Security Note**: The token is never sent to the browser.  The Cloudflare Worker
uses it server-side and returns only contribution counts and dates.

### Setting Your GitHub Username

Open `script.js` and find the `GITHUB_CONFIG` object:

```javascript
const GITHUB_CONFIG = {
    username: 'SorynTech',
    accountCreatedAt: new Date('2025-11-01')   // fallback only
};
```

- **username** – your GitHub login (used for all API calls).
- **accountCreatedAt** – only used when the API is unreachable (demo mode).
  When real data is available the account creation date comes from GitHub.

## How It Works

```
Browser                                  Cloudflare Worker                     GitHub
  │                                           │                                  │
  │  GET /api/github/contributions?username=…  │                                  │
  │ ─────────────────────────────────────────► │                                  │
  │                                           │  POST https://api.github.com/graphql
  │                                           │  (contributionsCollection query)  │
  │                                           │ ────────────────────────────────► │
  │                                           │ ◄──────── weeks + counts ──────── │
  │ ◄──── { weeks, totalContributions } ───── │                                  │
  │                                           │                                  │
  │  renderGitHubGraph(realData)              │                                  │
```

If the `/api/github/contributions` call fails the frontend automatically falls
back to `/api/github/user` (REST, for account age) and then to local demo
generation, marking the result with `isDemo: true`.

## API Endpoints

### `GET /api/github/contributions?username=…`
Returns real contribution data (last 52 weeks) via the GraphQL API.

**Response:**
```json
{
  "createdAt": "2025-11-01T…",
  "totalContributions": 842,
  "weeks": [
    { "contributionDays": [{ "date": "2025-02-01", "contributionCount": 5 }, …] },
    …
  ]
}
```

### `GET /api/github/user?username=…`  (unchanged)
Returns basic user info (login, name, created_at) via the REST API.

## Features

- **Real contribution data** fetched from GitHub's GraphQL API
- **Demo fallback** with a visible ⚠️ banner when the API key is missing
- **Statistics**: Total Contributions · Active Days · Avg per Day · Account Age
- **Interactive Hover**: date and count tooltip on each square
- **Responsive**: adapts to mobile and desktop
- **Secure**: token stays server-side in the Worker

## File Locations

| File | Purpose |
|---|---|
| `index.html` | Graph container (`#github-contribution-graph`) |
| `styles.css` | Contribution graph CSS (`.contribution-day.level-*`) |
| `script.js` | `GITHUB_CONFIG`, `fetchGitHubContributions`, `parseRealContributions`, `createDemoGraph`, `renderGitHubGraph` |
| `worker/src/index.js` | `handleGitHubContributions` (GraphQL proxy) and `handleGitHubUser` (REST proxy) |
| `worker.js` | Bundled Worker output (mirrors `worker/src/index.js`) |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Graph shows **"Demo / Sample Data"** banner | `GITHUB_API_KEY` secret is missing or the token lacks `read:user` / profile scope. |
| Graph shows **"API not configured"** | `CONFIG.API_BASE_URL` is empty – check the `#app-config` element's `data-api-url`. |
| 401 / 403 from GitHub | Token expired or wrong scope.  Regenerate and `wrangler secret put GITHUB_API_KEY`. |
| Counts seem stale | GitHub caches contribution data; changes may take a few minutes to appear. |
