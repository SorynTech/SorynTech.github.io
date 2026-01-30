# Using Cloudflare Workers for Environment Secrets

This project keeps API keys and credentials out of the frontend by running a **Cloudflare Worker** that holds secrets and proxies requests to JSONBin and ImgBB. Only the Worker sees the real keys; the browser only talks to your Worker and sends a JWT after login.

## How secrets work in Workers

- **Secrets** are not in your code or in `wrangler.toml`. They are stored in Cloudflare’s environment and injected at runtime.
- You set them with the **Wrangler CLI** (`wrangler secret put`) or in the **Cloudflare dashboard** (Workers & Pages → your worker → Settings → Variables and Secrets).
- In the Worker, they appear on the `env` object (e.g. `env.JSONBIN_API_KEY`). Never log or return these values to the client.

## Required secrets and variables

| Name | Kind | Description |
|------|------|-------------|
| `JWT_SECRET` | Secret | Random string used to sign JWTs (e.g. `openssl rand -hex 32`). |
| `PASSWORD_SALT` | Secret | Base64-encoded salt for PBKDF2 (same value for both users). |
| `OWNER_PASSWORD_HASH` | Secret | Hex PBKDF2 hash of owner password (see below). |
| `GUEST_PASSWORD_HASH` | Secret | Hex PBKDF2 hash of guest password. |
| `OWNER_USERNAME` | Secret or Var | Username for owner (default `owner`). |
| `GUEST_USERNAME` | Secret or Var | Username for guest (default `guest`). |
| `JSONBIN_API_KEY` | Secret | Your JSONBin “Master Key” from the dashboard. |
| `JSONBIN_BIN_ID` | Secret or Var | ID of the JSONBin bin (e.g. `65abc123...`). |
| `IMGBB_API_KEY` | Secret | Your ImgBB API key from the ImgBB dashboard. |
| `ALLOWED_ORIGINS` | Var | Comma-separated allowed origins (see CORS below). |

You can set **vars** in `wrangler.toml` under `[vars]` for non-sensitive values (e.g. `JSONBIN_BIN_ID`, `ALLOWED_ORIGINS`). Use **secrets** for anything sensitive (passwords, hashes, API keys, `JWT_SECRET`).

## Setting secrets with Wrangler

1. Install Wrangler and log in:

   ```bash
   npm i -g wrangler
   wrangler login
   ```

2. From the **`worker`** directory, deploy once (so the worker exists):

   ```bash
   cd worker
   npm install
   npm run deploy
   ```

3. Add each secret; Wrangler will prompt for the value (or you can pipe it):

   ```bash
   wrangler secret put JWT_SECRET
   wrangler secret put PASSWORD_SALT
   wrangler secret put OWNER_PASSWORD_HASH
   wrangler secret put GUEST_PASSWORD_HASH
   wrangler secret put JSONBIN_API_KEY
   wrangler secret put JSONBIN_BIN_ID
   wrangler secret put IMGBB_API_KEY
   wrangler secret put OWNER_USERNAME
   wrangler secret put GUEST_USERNAME
   ```

   Example with a generated value:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" | wrangler secret put JWT_SECRET
   ```

## Generating password hashes

Passwords are not stored in plain text. You store a **PBKDF2** hash (hex) and a **salt** (base64). The Worker uses the same salt and algorithm to verify logins.

1. Generate a salt (once, reuse for both users):

   ```bash
   node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
   ```

   Put that value in `PASSWORD_SALT` (see above).

2. Generate a hash for each password using the project script (use the **same** `PASSWORD_SALT` you set in the Worker):

   ```bash
   cd worker
   PASSWORD_SALT="<paste-the-same-base64-salt>" node scripts/hash-password.js "your_owner_password"
   ```

   Copy the printed hex and set it as `OWNER_PASSWORD_HASH`. Repeat for the guest password:

   ```bash
   PASSWORD_SALT="<same-salt>" node scripts/hash-password.js "your_guest_password"
   ```

   Set that hex as `GUEST_PASSWORD_HASH`.

Important: the salt in `PASSWORD_SALT` in Cloudflare must match the salt you use when running `hash-password.js`, or logins will fail.

## Setting secrets in the Cloudflare dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → your worker (e.g. `soryntech-api`).
2. Open **Settings** → **Variables and Secrets**.
3. Under **Encrypted variables (secrets)**, add each name and value. Save.

Use this when you don’t have Wrangler or prefer the UI. Values are encrypted and not shown again.

## CORS (ALLOWED_ORIGINS)

The Worker only allows requests from origins you list. Set `ALLOWED_ORIGINS` to a comma-separated list of:

- **Full origins**: `https://soryntech.github.io` (exact host match only).
- **Dot-prefixed domains**: `.github.io` allows `https://anything.github.io` (and `https://github.io`), but not `https://evil-github.io`.

Examples:

- `https://soryntech.github.io` — only that origin.
- `https://soryntech.github.io,.github.io` — that page plus any `*.github.io` (e.g. for PR previews).

You can set `ALLOWED_ORIGINS` as a **variable** in the dashboard or in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://soryntech.github.io"
```

## Listing and updating secrets

- **List names only** (values are never shown):

  ```bash
  wrangler secret list
  ```

- **Update a secret**: run `wrangler secret put <NAME>` again and enter the new value.
- **Delete a secret**: Cloudflare dashboard → Worker → Settings → Variables and Secrets → remove the variable.

## Local development

Secrets are not read from `.dev.vars` by default. Create a `.dev.vars` file in the `worker` directory (do **not** commit it):

```env
JWT_SECRET=your-local-jwt-secret
PASSWORD_SALT=your-base64-salt
OWNER_PASSWORD_HASH=hex-from-hash-script
GUEST_PASSWORD_HASH=hex-from-hash-script
OWNER_USERNAME=owner
GUEST_USERNAME=guest
JSONBIN_API_KEY=your-jsonbin-key
JSONBIN_BIN_ID=your-bin-id
IMGBB_API_KEY=your-imgbb-key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Then run:

```bash
npm run dev
```

Wrangler will load these into `env` for local requests only.

## Summary

- **Secrets** = sensitive data (keys, hashes, JWT secret). Set via `wrangler secret put` or dashboard; never in repo or `wrangler.toml`.
- **Vars** = non-sensitive config; can live in `wrangler.toml` or dashboard.
- **Password hashes** = generated with `scripts/hash-password.js` using the same `PASSWORD_SALT` you set in the Worker.
- **CORS** = controlled by `ALLOWED_ORIGINS`; use full origins or `.example.com` for subdomains only, never raw string suffixes for security.
