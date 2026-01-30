# Cloudflare Workers Secrets Setup

## 1. Your PASSWORD_SALT (use this exact value)

Use this pre-generated 16-byte salt for both owner and guest password hashes. **You must use this same value in Cloudflare and when running the hash script below.**

```
wK9xL2mN4pQ7rS0vY3zA6bC8dE1fG2hI=
```

Copy that entire line (without the backticks) as your `PASSWORD_SALT`.

---

## 2. Generate password hashes (do not skip)

Your Worker never stores plain passwords. It only stores **hashes**. You must generate two hashes and put them in Cloudflare.

**If you have Node.js installed**, from the `worker` folder run:

```bash
cd worker
set PASSWORD_SALT=wK9xL2mN4pQ7rS0vY3zA6bC8dE1fG2hI=
node scripts/hash-password.js "Ilovemycutegoat123"
```

Copy the **Hash (hex)** line from the output. That is your `OWNER_PASSWORD_HASH`.

Then run:

```bash
node scripts/hash-password.js "Guest_Rat"
```

Copy that **Hash (hex)**. That is your `GUEST_PASSWORD_HASH`.

**If you don’t have Node.js**, use one of these:

- Install Node from https://nodejs.org and run the commands above, or  
- Use the Cloudflare dashboard only and set a **temporary** simple password, then use an online PBKDF2-SHA256 (100000 iterations, 32 bytes) generator with the salt above to get hex hashes. Prefer the script for consistency.

---

## 3. What goes in Cloudflare (and what does not)

| In Cloudflare (Worker secrets/vars) | Never in frontend |
|-------------------------------------|--------------------|
| `JWT_SECRET` (random string, see below) | API keys |
| `PASSWORD_SALT` (the value from step 1) | Passwords or hashes |
| `OWNER_PASSWORD_HASH` (hex from step 2) | JSONBin key |
| `GUEST_PASSWORD_HASH` (hex from step 2) | ImgBB key |
| `OWNER_USERNAME` = `RatKing` | Bin ID (optional in frontend config) |
| `GUEST_USERNAME` = `Guest` | |
| `JSONBIN_API_KEY` = your **JSONBin Master Key** from https://jsonbin.io | |
| `JSONBIN_BIN_ID` = `697918e743b1c97be94f98e7` | |
| `IMGBB_API_KEY` = your ImgBB key | |
| `ALLOWED_ORIGINS` = `https://YOUR_USERNAME.github.io` (your Pages URL) | |

**Important:** The value you had that starts with `$2a$10$...` is a **bcrypt** hash, not a JSONBin API key. In Cloudflare you must set `JSONBIN_API_KEY` to your **actual JSONBin “Master Key”** (or “Access Key”) from the JSONBin dashboard (jsonbin.io → API Keys). It is usually a long alphanumeric string.

Generate a `JWT_SECRET` (any long random string). Example in PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Use that as `JWT_SECRET` in Cloudflare.

---

## 4. How to put these in Cloudflare Workers

### Option A: Cloudflare Dashboard (no CLI)

1. Go to **https://dash.cloudflare.com** → **Workers & Pages**.
2. Open your worker (e.g. `soryntech-api`) or create one and deploy the project first.
3. Go to **Settings** → **Variables and Secrets**.
4. Under **Encrypted variables (secrets)** click **Add** and add each of these (one by one). The value is never shown again after you save.

   - `JWT_SECRET` — (the random string you generated)
   - `PASSWORD_SALT` — `wK9xL2mN4pQ7rS0vY3zA6bC8dE1fG2hI=`
   - `OWNER_PASSWORD_HASH` — (hex from hash script for owner password)
   - `GUEST_PASSWORD_HASH` — (hex from hash script for guest password)
   - `OWNER_USERNAME` — `RatKing`
   - `GUEST_USERNAME` — `Guest`
   - `JSONBIN_API_KEY` — your real JSONBin Master Key from jsonbin.io
   - `JSONBIN_BIN_ID` — `697918e743b1c97be94f98e7`
   - `IMGBB_API_KEY` — your ImgBB API key (e.g. the one you listed)

5. Under **Environment variables** (non-encrypted) you can add:
   - `ALLOWED_ORIGINS` = `https://YOUR_GITHUB_USERNAME.github.io`  
   Replace `YOUR_GITHUB_USERNAME` with your GitHub username or your actual Pages URL.

6. Click **Save** and redeploy the worker if needed.

### Option B: Wrangler CLI

From the `worker` folder:

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

Then for each secret, run and paste the value when prompted:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put PASSWORD_SALT
npx wrangler secret put OWNER_PASSWORD_HASH
npx wrangler secret put GUEST_PASSWORD_HASH
npx wrangler secret put OWNER_USERNAME
npx wrangler secret put GUEST_USERNAME
npx wrangler secret put JSONBIN_API_KEY
npx wrangler secret put JSONBIN_BIN_ID
npx wrangler secret put IMGBB_API_KEY
```

For `ALLOWED_ORIGINS` you can add it as a **variable** in the dashboard, or in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://YOUR_GITHUB_USERNAME.github.io"
```

---

## 5. How the frontend gets “env” (without showing secrets to users)

**The frontend never receives your Cloudflare env variables.** That’s intentional.

- **Secrets stay in the Worker.** Only the Worker process can read `env.JWT_SECRET`, `env.JSONBIN_API_KEY`, etc. The browser cannot and should not ever see them.
- **The frontend only needs:**
  1. **Worker URL** — The public URL of your Worker (e.g. `https://soryntech-api.<your-subdomain>.workers.dev`). You put this in your frontend as the “API base URL” (e.g. in `index.html` in the `data-api-url` attribute on `#app-config`).
  2. **JWT token** — After the user logs in, the frontend sends username/password to the Worker’s `/api/auth/login`; the Worker checks the password (using the hashes from env), then returns a **JWT**. The frontend stores that JWT (e.g. in `sessionStorage`) and sends it on every request as `Authorization: Bearer <token>`. The Worker uses the JWT to know who is logged in and whether they are owner or guest; it never sends env vars to the browser.

So:

- You **put** all env variables (secrets and vars) **only in Cloudflare** (dashboard or Wrangler).
- You **do not** copy API keys or passwords into the frontend repo or any client-side config.
- The frontend “gets” the benefit of env by **calling your Worker**. The Worker reads env and uses it to call JSONBin and ImgBB; the frontend only sees the Worker’s responses (e.g. data, “login success”, image URL). No secrets are ever sent to the user’s browser.

---

## 6. Frontend config (only the Worker URL)

In your GitHub Pages site, the only “config” the frontend needs is the Worker URL:

- In `index.html`, set the `data-api-url` on the `#app-config` element to your Worker URL, for example:
  `https://soryntech-api.<your-account-subdomain>.workers.dev`

After deploy, find the exact URL in the Cloudflare dashboard (Workers & Pages → your worker → overview). Use that as `data-api-url`. No API keys or passwords go there.

---

## 7. Quick checklist

- [ ] Use `PASSWORD_SALT` = `wK9xL2mN4pQ7rS0vY3zA6bC8dE1fG2hI=` everywhere (Worker + hash script).
- [ ] Generate and set `OWNER_PASSWORD_HASH` and `GUEST_PASSWORD_HASH` (hex from script).
- [ ] Set `JSONBIN_API_KEY` to your **real** JSONBin Master Key from jsonbin.io (not a bcrypt string).
- [ ] Add all secrets in Cloudflare (dashboard or `wrangler secret put`).
- [ ] Set `ALLOWED_ORIGINS` to your GitHub Pages origin.
- [ ] In the frontend, set only `data-api-url` to your Worker URL. No other env vars in the frontend.
