# 🚀 Backend Deployment Guide (Render.com - FREE)

## Why Deploy Backend?
Your app now includes:
- ✅ PDF Resume Parsing
- ✅ AI-Powered Candidate Extraction (Gemini)
- ✅ Resume Upload API
- ✅ Job Matching Engine

These features require a backend server!

---

## Step 1: Deploy Backend to Render (5 minutes)

### Option A: One-Click Deploy 🎯 (Easiest)

1. **Click this button:**  
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. **Fill in environment variables:**
   ```
   SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=(get from Supabase dashboard)
   GEMINI_API_KEY=AIzaSyCfOJHFXP2PbCjkByXj-D-Mr5kXui8zIp8
   ```

3. **Wait for deployment** (5-10 minutes)

4. **Copy your backend URL**: `https://recruit-suite-backend.onrender.com`

---

### Option B: Manual Deploy

1. **Sign up at** [Render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repo: `surajikf/Recruit-Suite-for-Remote-Recruitment`
   - Name: `recruit-suite-backend`
   - Region: `Oregon` (US West)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: `Free`

3. **Add Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
   SUPABASE_SERVICE_ROLE_KEY=(Get from Supabase Dashboard → Settings → API → service_role key)
   GEMINI_API_KEY=AIzaSyCfOJHFXP2PbCjkByXj-D-Mr5kXui8zIp8
   PUBLIC_BASE_URL=https://recruit-suite-backend.onrender.com
   ```

4. **Deploy!**

---

## Step 2: Update Frontend to Use Deployed Backend

**Create `frontend/.env.production`:**
```env
VITE_API_URL=https://recruit-suite-backend.onrender.com
VITE_SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
```

---

## Step 3: Build & Deploy Frontend to GitHub Pages

Run these commands:
```bash
cd frontend
npm install
npm run build
cd ..
git add .
git commit -m "Deploy with backend integration"
git push origin main
```

---

## Step 4: Enable GitHub Pages

1. Go to: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/settings/pages
2. Source: `Deploy from branch`
3. Branch: `main` / folder: `/frontend/dist` or `/docs`
4. Save

---

## ⚠️ Important Notes

### Free Tier Limitations:
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Good for demo, upgrade to paid for production

### Alternative: Paid Options ($7-10/month)
- **Railway**: https://railway.app (faster, no spin-down)
- **Fly.io**: https://fly.io (global edge deployment)
- **Vercel Functions**: Serverless (auto-scales)

---

## Troubleshooting

### Backend deployment fails?
- Check Render logs for errors
- Verify all env variables are set
- Make sure backend builds locally: `cd backend && npm run build`

### Frontend can't connect to backend?
- Check CORS is enabled in backend
- Verify VITE_API_URL in frontend/.env.production
- Check browser console for CORS errors

### Resume upload not working?
- Verify Gemini API key is valid
- Check Render logs for PDF parsing errors
- Ensure file size limits are not exceeded

---

## Cost Breakdown

| Service | Cost | Purpose |
|---------|------|---------|
| Render Free Tier | $0 | Backend API |
| GitHub Pages | $0 | Frontend hosting |
| Supabase Free | $0 | Database |
| Gemini API | $0 (with limits) | AI processing |

**Total: FREE** ✨

---

## Your Deployed URLs

After deployment, you'll have:
- **Frontend**: https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment
- **Backend**: https://recruit-suite-backend.onrender.com
- **API Docs**: https://recruit-suite-backend.onrender.com/api/health

---

**Questions?** Check Render dashboard logs for any issues!

