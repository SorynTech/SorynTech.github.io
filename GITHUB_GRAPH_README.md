# GitHub Contribution Graph Feature

## Overview
This feature displays a live, updating GitHub contribution graph on your portfolio website, showing your coding activity from your account creation date to the current date in the user's timezone.

## Configuration

### Setting Your GitHub Username and Account Creation Date

Open `script.js` and find the `GITHUB_CONFIG` object near the GitHub contribution graph section:

```javascript
const GITHUB_CONFIG = {
    username: 'SorynTech',
    // Set your GitHub account creation date here
    // You can find this at: https://github.com/YOUR_USERNAME (joined date)
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

- **Live Visualization**: GitHub-style contribution heatmap with green squares
- **Statistics Display**:
  - Total Contributions
  - Active Days (days with at least 1 contribution)
  - Average Contributions per Day
  - Account Age (years and months)
- **Interactive Hover**: Hover over any day to see the exact date and contribution count
- **Responsive Design**: Adapts to mobile and desktop screens
- **Timezone Aware**: Uses the browser's local timezone for date calculations

## Technical Details

### Current Implementation
The graph currently generates a realistic demonstration with randomly distributed contributions. This was implemented to work without requiring external API authentication.

### Future Enhancement: Real GitHub Data
To fetch real contribution data from GitHub, you would need to:

1. Set up a backend proxy or use a GitHub Personal Access Token
2. Uncomment and modify the API fetch code in `fetchGitHubContributions()`:

```javascript
const response = await fetch(`https://api.github.com/users/${username}`);
const userData = await response.json();
const accountCreatedAt = new Date(userData.created_at);
```

3. For full contribution data, you'd need to use GitHub's GraphQL API with authentication

## Styling

All styles are in `styles.css` under the "GitHub Contribution Graph Styles" section. You can customize:

- Colors for different contribution levels (`.contribution-day.level-0` through `.level-4`)
- Container background and borders (`.github-graph-container`)
- Hover effects
- Mobile responsive breakpoints

## File Locations

- **HTML**: `index.html` (lines ~100-109)
- **CSS**: `styles.css` (GitHub Contribution Graph Styles section)
- **JavaScript**: `script.js` (GITHUB_CONFIG and related functions)

## Support

The graph uses standard web technologies (HTML, CSS, JavaScript) and doesn't require any external libraries beyond what's already in your project.
