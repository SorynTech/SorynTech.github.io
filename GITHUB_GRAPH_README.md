# GitHub Contribution Graph Feature

## Overview
This feature displays a live, updating GitHub contribution graph on your portfolio website, showing your coding activity from your account creation date to the current date in the user's timezone.

## Configuration

### GitHub API Key Setup

The GitHub graph feature requires a GitHub Personal Access Token to fetch real contribution data.

#### What is Required

You need to create a GitHub Personal Access Token (classic) with the following permissions:
- `public_repo` - Access public repositories
- `read:user` - Read user profile data

#### How to Create the API Key

1. Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Portfolio Website")
4. Select the following scopes:
   - `public_repo` - Access public repositories
   - `read:user` - Read user profile data
5. Click "Generate token"
6. Copy the token immediately (you won't be able to see it again)

#### How to Configure the API Key

Add the token as an environment variable in your Cloudflare Worker:

```bash
wrangler secret put GITHUB_API_KEY
```

Then paste your GitHub Personal Access Token when prompted.

**Security Note**: The GitHub API key is kept secure on the server side. The Cloudflare Worker acts as a proxy, using the key to fetch data from GitHub and returning only the necessary information to the frontend. The API key is never exposed to the client.

### Setting Your GitHub Username and Account Creation Date

Open `script.js` and find the `GITHUB_CONFIG` object near the GitHub contribution graph section:

```javascript
const GITHUB_CONFIG = {
    username: 'SorynTech',
    accountCreatedAt: new Date('2020-01-15')
};
```

Update the values:
1. **username**: Your GitHub username
2. **accountCreatedAt**: The date you created your GitHub account (YYYY-MM-DD format)

### How to Find Your Account Creation Date

1. Go to your GitHub profile: `https://github.com/YOUR_USERNAME`
2. Look for the "Joined" date in your profile
3. Use that date in the format: `new Date('YYYY-MM-DD')`

## Features

- **Live Visualization**: GitHub-style contribution heatmap with pink squares matching the website theme
- **Statistics Display**:
  - Total Contributions
  - Active Days (days with at least 1 contribution)
  - Average Contributions per Day
  - Account Age (years and months)
- **Interactive Hover**: Hover over any day to see the exact date and contribution count
- **Responsive Design**: Adapts to mobile and desktop screens
- **Timezone Aware**: Uses the browser's local timezone for date calculations
- **Error Handling**: Shows "API not configured" message if the GitHub API key is not set up

## Styling

All styles are in `styles.css` under the GitHub graph section. The graph uses pink colors to match the website theme:

- Colors for different contribution levels use pink shades (`.contribution-day.level-0` through `.level-4`)
- Container has transparent background to blend with the website theme
- 5px spacing between the graph and social links section

## File Locations

- **HTML**: `index.html` (GitHub graph container section)
- **CSS**: `styles.css` (GitHub Contribution Graph styles)
- **JavaScript**: `script.js` (GITHUB_CONFIG and related functions)
- **Backend**: `worker/src/index.js` (GitHub API key endpoint)

## Support

The graph uses standard web technologies (HTML, CSS, JavaScript) and fetches data through your Cloudflare Worker backend to keep the API key secure.
