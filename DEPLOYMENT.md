# 🚀 Deployment Guide - Recruit Suite

## Deploying to Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **Import your GitHub repository**:
   - Connect your GitHub account
   - Select: `surajikf/Recruit-Suite-for-Remote-Recruitment`

3. **Configure Project Settings**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   Go to Settings → Environment Variables and add:
   ```
   VITE_SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
   ```

5. **Deploy**: Click "Deploy" button

---

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Configuration Files

### vercel.json (Root)
Already configured with:
- Build command points to frontend directory
- Output directory set to frontend/dist
- URL rewrites for SPA routing

### frontend/.env (Create if missing)
```env
VITE_SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
```

---

## Troubleshooting

### 404 Error
✅ **Fixed!** The vercel.json now correctly points to the frontend directory.

### Build Fails
- Make sure all dependencies are in `frontend/package.json`
- Check that `npm run build` works locally in the frontend folder
- Verify environment variables are set in Vercel dashboard

### Blank Page After Deploy
- Check browser console for errors
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Make sure base URL is correct in vite.config.ts

### API Calls Failing
- Update API calls to use full Supabase URLs (not localhost)
- The app uses Supabase directly (no backend deployment needed)

---

## Post-Deployment

### 1. Update Supabase Settings
Go to your Supabase dashboard and add your Vercel URL to allowed origins:
```
Dashboard → Settings → API → Site URL
Add: https://your-app.vercel.app
```

### 2. Test Core Features
- ✅ Login/Signup
- ✅ Job creation
- ✅ Candidate upload
- ✅ Kanban drag & drop
- ✅ Filtering and search

### 3. Custom Domain (Optional)
In Vercel dashboard:
- Go to Settings → Domains
- Add your custom domain
- Follow DNS configuration steps

---

## Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment&root-directory=frontend&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

---

## Architecture

```
Recruit Suite
├── Frontend (Deployed on Vercel)
│   ├── React + TypeScript + Vite
│   ├── TailwindCSS
│   └── Direct Supabase connection
│
└── Backend (Not needed for Vercel)
    └── Supabase handles all backend (hosted separately)
```

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally: `cd frontend && npm run build`
4. Check Supabase connection

---

**Last Updated**: September 30, 2025
**Version**: 1.0.0
