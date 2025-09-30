# 🚀 GitHub Pages Deployment

Your app will be live at:
**https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment/**

## ✅ Setup Complete!

The GitHub Actions workflow is already configured and will automatically deploy on every push to `main`.

## 📋 One-Time Setup (Do this once):

### 1. Enable GitHub Pages
1. Go to: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/settings/pages
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
3. Click "Save"

That's it! 🎉

---

## 🔄 How It Works

Every time you push to the `main` branch:
1. GitHub Actions automatically runs
2. Builds the frontend with production settings
3. Deploys to GitHub Pages
4. Your site updates in ~2-3 minutes

---

## 🔍 Check Deployment Status

Go to: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/actions

You'll see:
- ✅ Green checkmark = Deployed successfully
- 🟡 Yellow dot = Building...
- ❌ Red X = Build failed (check logs)

---

## 🎯 What's Configured

✅ Vite base path: `/Recruit-Suite-for-Remote-Recruitment/`
✅ Environment variables: Supabase URL & Key (hardcoded in workflow)
✅ Auto-deploy on push to main
✅ GitHub Actions workflow created

---

## 🛠️ Manual Deployment

If you want to deploy manually:

```bash
cd frontend
npm run build
```

Then commit and push the changes.

---

## 🌐 Testing Locally with Production Base

To test with the GitHub Pages base path locally:

```bash
cd frontend
npm run build
npm run preview
```

Then open: http://localhost:4173/Recruit-Suite-for-Remote-Recruitment/

---

## 📱 After Deployment

Your app will be accessible at:
```
https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment/
```

All routes will work:
- `/` - Dashboard
- `/jobs` - Jobs page
- `/candidates` - Candidates page
- `/shortlist` - Kanban board (with drag & drop!)
- `/reports` - Reports
- `/calendar` - Calendar

---

## 🔐 Security Notes

- ✅ Supabase credentials are in the GitHub Actions workflow (they're public API keys, safe to expose)
- ✅ No backend needed - app connects directly to Supabase
- ✅ All data stored securely in Supabase

---

## 🎉 Advantages of GitHub Pages

1. **Free hosting** - No cost!
2. **Auto-deploy** - Push to main = instant deploy
3. **Fast CDN** - GitHub's global CDN
4. **HTTPS by default** - Secure connection
5. **Custom domains** - Can add your own domain later

---

## 🐛 Troubleshooting

### 404 on Routes
- GitHub Pages is configured for SPA routing
- All routes redirect to index.html

### Blank Page
- Check Actions tab for build errors
- Verify Supabase connection in browser console

### Deployment Not Running
- Make sure GitHub Pages source is set to "GitHub Actions"
- Check repository settings → Pages

---

## 🚀 Next Steps

1. Enable GitHub Pages (see step 1 above)
2. Push the code
3. Wait 2-3 minutes
4. Visit: https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment/

Done! 🎊
