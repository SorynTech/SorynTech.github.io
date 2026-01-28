# 🐀 SorynTech Portfolio

A modern, cloud-powered portfolio website featuring Discord bots, art gallery, and social links with real-time data synchronization.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-success)
![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎨 **Interactive Art Gallery** - Password-protected showcase with cloud storage
- 🤖 **Discord Bots Showcase** - Display your bots with stats and invite links
- 🔗 **Social Links Hub** - All your socials in one place
- 🎮 **Game Accounts** - Copy-to-clipboard game usernames
- 👑 **Owner Dashboard** - Edit everything through the website UI
- ☁️ **Cloud Storage** - JSONBin for data, ImgBB for images
- 🔐 **Role-Based Access** - Owner and Guest login system
- 📱 **Fully Responsive** - Works on all devices

## 🚀 Live Demo

Visit: `https://yourusername.github.io/your-repo/`

**Test Credentials:**
- **Owner:** `soryn` / `ratking123` (full edit access)
- **Guest:** `guest` / `cheese456` (view gallery only)

## 🛠️ Tech Stack

- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks!)
- **Styling:** Custom CSS with gradient animations
- **Fonts:** Righteous + DM Sans (Google Fonts)
- **Data Storage:** [JSONBin.io](https://jsonbin.io) (Cloud database)
- **Image Hosting:** [ImgBB](https://imgbb.com) (Free CDN)
- **Deployment:** GitHub Pages with Actions

## 📋 Prerequisites

Before you start, you'll need:

1. **GitHub Account** (free)
2. **JSONBin Account** (free) - [Sign up here](https://jsonbin.io)
3. **ImgBB Account** (free) - [Sign up here](https://imgbb.com)
4. **5 minutes** of setup time

## 🔧 Setup Instructions

### 1. Clone or Fork This Repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Get Your API Keys

#### JSONBin API Key:
1. Go to [jsonbin.io](https://jsonbin.io)
2. Sign up/login
3. Go to **Account** → **API Keys**
4. Copy your **Master Key**

#### JSONBin Bin ID:
1. Visit [jsonbin.io/app/bins](https://jsonbin.io/app/bins)
2. Click **"Create Bin"**
3. Name it: `portfolio-data`
4. Paste this initial data:
```json
{
  "bots": [],
  "profile": {
    "name": "Your Name",
    "role": "Your Role",
    "image": "profile.jpg",
    "socials": {
      "twitter": "https://x.com/yourhandle",
      "instagram": "https://instagram.com/yourhandle",
      "github": "https://github.com/yourhandle",
      "discord": "https://discord.gg/yourid",
      "kofi": "https://ko-fi.com/yourhandle"
    }
  },
  "gallery": []
}
```
5. Click **"Create"** and copy the **Bin ID**

#### ImgBB API Key:
1. Go to [api.imgbb.com](https://api.imgbb.com/)
2. Click **"Get API Key"**
3. Sign up/login
4. Copy your API key

### 3. Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these **7 secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SORYN_USER` | `soryn` | Owner username (change to yours) |
| `SORYN_PASS` | `your-secure-password` | Owner password |
| `GUEST_USER` | `guest` | Guest username |
| `GUEST_PASS` | `guest-password` | Guest password |
| `JSONBIN_API_KEY` | Your JSONBin Master Key | From step 2 |
| `JSONBIN_BIN_ID` | Your Bin ID | From step 2 |
| `IMGBB_API_KEY` | Your ImgBB API Key | From step 2 |

### 4. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### 5. Deploy

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Your site will be live at `https://yourusername.github.io/your-repo/` in 1-2 minutes!

## 📁 Project Structure

```
portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deployment workflow
├── index.html                  # Main HTML structure
├── styles.css                  # All styling
├── script.js                   # Cloud-powered logic
├── profile.jpg                 # Your profile picture
├── .gitignore                  # Prevents committing env.js
├── README.md                   # This file
└── env.js                      # ⚠️ Never commit! (auto-generated)
```

## 🎨 Customization

### Change Your Profile Info

1. Login as owner on your live site
2. Click on your **name** to edit
3. Click on your **role** to edit
4. Click on your **profile picture** to change it
5. **Right-click** any social link to edit

All changes save automatically to the cloud! ☁️

### Add Discord Bots

1. Login as owner
2. Go to **Discord Bots** section
3. Click **"🐀 Add Bot"**
4. Fill in details:
   - Icon (emoji)
   - Name and description
   - Server/user stats
   - Invite link
   - GitHub repo link
5. Click **"Save Bot/Project 🐀"**

### Upload Art to Gallery

**Method 1: Direct Upload**
1. Login as owner
2. Go to **Art Gallery**
3. Click **"🎨 Upload from Device"**
4. Select images
5. Wait for upload → Done! ✨

**Method 2: Add Image URL**
1. Upload image to [imgbb.com](https://imgbb.com)
2. Copy the direct link
3. Click **"🔗 Add Image URL"**
4. Paste link and add title/description
5. Click **"Add to Gallery 🐀"**

### Change Color Theme

Edit `styles.css` and modify the CSS variables:

```css
:root {
    --bg-primary: #1a1d2e;        /* Main background */
    --accent-primary: #7dd3fc;    /* Primary accent (cyan) */
    --accent-secondary: #a855f7;  /* Secondary accent (purple) */
    --text-primary: #dfe6e9;      /* Main text color */
}
```

## 🔐 Security

### Important Security Notes:

⚠️ **NEVER commit `env.js` to GitHub!**
- The `.gitignore` file prevents this
- GitHub Actions creates it from secrets during deployment
- Your API keys stay safe

⚠️ **Change Default Passwords!**
- Update `SORYN_PASS` and `GUEST_PASS` in GitHub Secrets
- Use strong, unique passwords

⚠️ **API Key Best Practices:**
- Don't share your API keys with anyone
- Don't screenshot them when asking for help
- Regenerate keys if compromised

## 🐛 Troubleshooting

### Site Not Loading After Deploy

**Check:**
1. Go to **Actions** tab on GitHub
2. Look for failed workflows (red X)
3. Click on the failed workflow to see logs
4. Common issues:
   - Missing GitHub Secret
   - Typo in secret name
   - Invalid API key

### "JSONBin API key not configured!"

**Fix:**
1. Verify `JSONBIN_API_KEY` is added to GitHub Secrets
2. Check there are no extra spaces
3. Redeploy by pushing a new commit

### Images Not Uploading

**Fix:**
1. Verify `IMGBB_API_KEY` is correct
2. Check file size (max 32MB)
3. Ensure file is an image format
4. Check browser console (F12) for errors

### Gallery Won't Unlock

**Fix:**
1. Check login credentials match GitHub Secrets
2. Try refreshing the page
3. Clear browser cache

### Changes Not Saving

**Fix:**
1. Verify you're logged in as owner (see 👑 crown icon)
2. Check browser console (F12) for errors
3. Verify JSONBin API key is valid
4. Check network tab to see API calls

## 📊 API Usage & Limits

### JSONBin Free Tier
- ✅ 100 API calls per minute
- ✅ Unlimited bins
- ✅ Perfect for portfolio use
- 📈 You'll use ~2-5 calls per session

### ImgBB Free Tier
- ✅ Unlimited image uploads
- ✅ No bandwidth limits
- ✅ 32MB max per image
- ✅ Permanent storage
- 📈 No daily limits!

## 🎯 Usage Tips

### Best Practices:

1. **Backup Your Data**
   - Go to [jsonbin.io/app/bins](https://jsonbin.io/app/bins)
   - Download your bin periodically
   - Keep a local backup

2. **Optimize Images**
   - Compress images before uploading
   - Use formats: JPG (photos), PNG (graphics), WebP (best)
   - Recommended size: Under 2MB per image

3. **Test Before Pushing**
   - Make changes on live site
   - Test on mobile devices
   - Check different browsers

4. **Version Control**
   - Commit often with clear messages
   - Use branches for major changes
   - Keep main branch stable

## 🤝 Contributing

Want to improve this portfolio? Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **JSONBin.io** - Free cloud database
- **ImgBB** - Free image hosting
- **GitHub Pages** - Free web hosting
- **Google Fonts** - Typography

## 📧 Support

Need help? Here's where to look:

1. **Check the guides:**
   - `SETUP_GUIDE.md` - Initial setup
   - `GITHUB_SECRETS_SETUP.md` - Secrets configuration
   
2. **Check browser console:**
   - Press F12
   - Look for error messages
   - Most issues show clear error logs

3. **Common Resources:**
   - [JSONBin Documentation](https://jsonbin.io/api-reference)
   - [ImgBB API Docs](https://api.imgbb.com/)
   - [GitHub Pages Docs](https://docs.github.com/pages)

## 🎉 You're All Set!

Your portfolio is now:
- ✅ Cloud-powered
- ✅ Auto-deploying
- ✅ Fully editable through the UI
- ✅ Mobile responsive
- ✅ Lightning fast

**Go create something awesome!** 🐀✨

---

Made with 💜 by SorynTech | Powered by JSONBin + ImgBB + GitHub Pages
