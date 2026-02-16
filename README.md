# 🐀 SorynTech Portfolio

A React-powered portfolio website for SorynTech — Backend Developer, Artist, and Discord Bot Creator.

## 🚀 Tech Stack

- **React 18** — UI framework with component-based architecture
- **Vite** — Fast build tool and dev server
- **CSS** — Custom styles with skeleton loading animations
- **GitHub Pages** — Static hosting via GitHub Actions

## 📁 Project Structure

```
├── react-app/              # React application source
│   ├── index.html           # React entry HTML
│   └── src/
│       ├── main.jsx         # React entry point
│       ├── App.jsx          # Main app component
│       ├── hooks.js         # Auth, data loading, notification hooks
│       ├── useDelayedLoad.js # 0.5s skeleton delay hook
│       ├── skeleton.css     # Skeleton loading animations
│       └── components/
│           ├── Navigation.jsx
│           ├── LoginModal.jsx
│           ├── SocialsSection.jsx
│           ├── ContentSections.jsx  # Bots, Projects, Art, Commissions
│           ├── PrivacySection.jsx
│           ├── Skeletons.jsx
│           └── Footer.jsx
├── styles.css               # Shared CSS (used by both React and non-React)
├── non-react-index.html     # Original static HTML version (preserved)
├── before-react-script.js   # Original JS for the static version (preserved)
├── vite.config.js           # Vite build configuration
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions: build React → deploy to Pages
└── react-build/             # Vite build output (gitignored)
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 How It Works

### React App (Primary)
The React app is the main site served by GitHub Pages. It includes:
- **Skeleton loading** — Every element shows an animated skeleton placeholder for 0.5 seconds before revealing content
- **Section-based navigation** — Socials, Discord Bots, Projects, Art Gallery, Commissions, Privacy Policy
- **Auth system** — Login via API to access protected content (bots, projects, galleries)
- **Login is just to stop AI scrapers** — Guest credentials are provided for legitimate visitors

### Non-React Version (Preserved)
The original static HTML version is preserved as `non-react-index.html` with its script at `before-react-script.js` and can be accessed directly at `/non-react-index.html`.

## 🚢 Deployment

Deployment is handled automatically by GitHub Actions on push to `main`:

1. Checks out the repository
2. Installs Node.js dependencies
3. Builds the React app with Vite (output → `react-build/`)
4. Copies React build + static assets into a `deploy/` directory
5. Deploys to GitHub Pages

The React app's `index.html` becomes the site root, so visitors see the React version by default.

## 🤖 AI Crawler Protection

- **robots.txt** blocks AI training bots and scrapers
- **Dark Visitors** integration for bot detection
- **Login gate** prevents automated content scraping (guest credentials provided for real visitors)

## 📜 License

Use these files freely for your portfolio!

---

**🐀 The rat sees you. The rat trusts you. The bots? Not so much.**