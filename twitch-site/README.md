# 🐀 SorynTech Twitch Redirect

This is a self-contained website for `twitch.soryntech.me` that embeds the Twitch stream and chat for **zippydrawz**.

## 🚀 Features
- **Twitch Interactive Embed**: Shows the stream and chat side-by-side.
- **SorynTech Design**: Matches the main portfolio's aesthetic (cheese-bg, dark theme, gradients).
- **Responsive**: Adapts to different screen sizes.

## 🛠️ Setup as a New Repository
To host this on its own repository (e.g., for GitHub Pages on a subdomain):

1. **Create a new repository** on GitHub.
2. **Initialize and Push**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Twitch redirect site"
   git remote add origin <your-new-repo-url>
   git branch -M main
   git push -u origin main
   ```
3. **Configure CNAME**:
   - Create a file named `CNAME` in the root of the new repository with the following content:
     ```
     twitch.soryntech.me
     ```
4. **GitHub Pages Settings**:
   - Go to the repository settings -> Pages.
   - Set the source to "Deploy from a branch" and select `main`.

## 🌐 DNS Configuration
Ensure your DNS provider (e.g., Cloudflare) has a `CNAME` record:
- **Type**: `CNAME`
- **Name**: `twitch`
- **Target**: `<your-github-username>.github.io`
- **Proxy status**: Proxied (recommended)

---
**🐀 The rat is watching... the stream.**
