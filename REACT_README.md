# React Portfolio with Skeleton Loading

This portfolio website has been converted to React with skeleton loading animations as a proof of concept.

## Features

- ⚛️ Built with React 18
- 🎨 Skeleton loading animations for better UX
- ⚡ Fast build with Vite
- 🐀 Maintains original SorynTech branding and design
- 📱 Fully responsive

## Skeleton Loading Components

The app includes reusable skeleton components:

- `SkeletonText` - For text placeholders
- `SkeletonAvatar` - For circular profile images
- `SkeletonCard` - For card-based content
- `SkeletonButton` - For button placeholders
- `SkeletonNavItem` - For navigation items
- `SkeletonLanyard` - For the profile lanyard card

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

1. The app starts with a loading state
2. Skeleton loaders display while content is being fetched
3. Content smoothly fades in once loaded
4. Demo button allows you to see the skeleton animation again

## Structure

```
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   ├── components/
│   │   └── Skeleton.jsx     # Reusable skeleton components
│   └── styles/
│       └── skeleton.css     # Skeleton animation styles
├── index.html               # HTML entry point
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Deployment

The GitHub Actions workflow automatically:
1. Installs dependencies
2. Builds the React app
3. Copies static assets to dist/
4. Deploys to GitHub Pages

## Original Files

Original HTML/JS files are backed up in:
- `index-original.html`
- `original-files/` directory
