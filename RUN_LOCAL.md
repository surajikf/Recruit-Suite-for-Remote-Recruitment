# 🚀 Run Locally for Instant Testing

## Why Run Locally?
- ✅ **Instant changes** - See updates immediately (no 3-minute wait)
- ✅ **Test before deploying** - Make sure everything works
- ✅ **Same as production** - Uses real Supabase database

---

## Quick Start (30 seconds)

### Open 2 Terminal Windows:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Opens at: http://localhost:5173

**That's it!** Your app is running locally! 🎉

---

## What You Get:

✅ **Instant Updates** - Any code change shows immediately  
✅ **Real Data** - Uses same Supabase database  
✅ **All Features Working**:
- Upload resumes
- Extract names & emails
- Delete candidates
- Multi-select & bulk delete
- View PDFs
- Everything!

---

## Workflow:

### 1. Test Locally (Instant):
```bash
cd frontend
npm run dev
# Open http://localhost:5173
# Make changes, see results instantly!
```

### 2. When Ready, Deploy:
```bash
npm run build
cd ..
git add -A
git commit -m "Your message"
git push origin main
# Wait 2-3 minutes for GitHub Pages
```

---

## Pro Tips:

### Keep Both Running:
1. **Local**: http://localhost:5173 (for testing)
2. **Production**: https://surajikf.github.io/... (for sharing)

### Instant Reload:
- Save any file in `frontend/src/`
- Browser auto-refreshes
- See changes in 1 second!

---

## Setup Supabase Storage (One-Time):

To make PDF upload/view work:

1. Go to: https://supabase.com/dashboard/project/czzpkrtlujpejuzhdnnr/storage/buckets
2. Click "New Bucket"
3. Name: `resumes`
4. Check "Public bucket" ✅
5. Click "Create"

---

## Your Commands:

```bash
# Start local dev (instant testing):
cd frontend
npm run dev

# Build for production:
npm run build

# Deploy to GitHub Pages:
cd ..
git add -A
git commit -m "Update"
git push origin main
```

---

**Recommendation:** Always test locally first, then deploy! 🚀

