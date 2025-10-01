# ⚡ QUICK DEPLOY GUIDE - For Your Boss Demo

## 🎯 Current Situation
You're sharing: https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment  
**Problem**: Backend API is running on localhost - won't work for external users!

---

## ✅ SOLUTION: 3 Steps to Deploy (15 minutes)

### Step 1: Deploy Backend to Render.com (FREE)

1. **Go to** [Render.com](https://dashboard.render.com/select-repo?type=web) 
2. **Connect your GitHub** and select repo: `Recruit-Suite-for-Remote-Recruitment`
3. **Configure Service:**
   ```
   Name: recruit-suite-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   
   SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
   
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
   
   GEMINI_API_KEY=AIzaSyCfOJHFXP2PbCjkByXj-D-Mr5kXui8zIp8
   
   PUBLIC_BASE_URL=https://recruit-suite-backend.onrender.com
   ```
   
   **Get SUPABASE_SERVICE_ROLE_KEY:**
   - Go to https://supabase.com/dashboard/project/czzpkrtlujpejuzhdnnr/settings/api
   - Copy the `service_role` key (NOT anon key)
   - Add as environment variable

5. **Click "Deploy"** - Wait 5-10 minutes

6. **Copy your backend URL**: It will be like `https://recruit-suite-backend-xxxx.onrender.com`

---

### Step 2: Add GitHub Secrets for Frontend

1. **Go to**: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/settings/secrets/actions

2. **Click "New repository secret"** and add these 3 secrets:

   **Secret 1:**
   ```
   Name: VITE_API_URL
   Value: https://recruit-suite-backend-xxxx.onrender.com
   (Use YOUR actual Render URL from Step 1)
   ```

   **Secret 2:**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://czzpkrtlujpejuzhdnnr.supabase.co
   ```

   **Secret 3:**
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
   ```

---

### Step 3: Enable GitHub Pages & Deploy

1. **Go to**: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/settings/pages

2. **Configure:**
   - Source: **Deploy from a branch**  
   - Branch: `main`
   - Folder: `/ (root)` or if that doesn't work, try `/frontend/dist`
   - Click **Save**

3. **Trigger Deployment:**
   ```bash
   git add .
   git commit -m "Configure deployment with backend integration"
   git push origin main
   ```

4. **Wait 2-3 minutes** and check: https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment

---

## 🎉 YOU'RE DONE!

Your app is now fully deployed at:
- **Frontend**: https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment
- **Backend**: https://recruit-suite-backend-xxxx.onrender.com

---

## 📱 Demo Features for Your Boss

### 1. Upload Real Resumes
- Upload PDF resumes
- AI automatically extracts names, emails, skills
- Shows parsed data instantly

### 2. Create Job Postings
- Add job requirements
- Set experience levels
- Define required skills

### 3. AI-Powered Matching
- Select a job
- See candidates ranked by match score
- AI explains why each candidate matches

### 4. Kanban Pipeline
- Drag candidates through hiring stages
- Track progress visually
- Update statuses

### 5. Reports & Analytics
- View hiring metrics
- See top skills
- Track performance

---

## ⚠️ Important Notes

### First-Time Load (Render Free Tier)
- Backend may take 30-60 seconds on first request
- It "wakes up" from sleep
- Subsequent requests are instant

### What to Tell Your Boss:
"The first page load might take a minute as the free backend server wakes up. After that, everything is instant. For production, we'd use a paid tier ($7/month) with no delays."

---

## 🚨 Troubleshooting

### Resume upload not working?
1. Check Render logs: https://dashboard.render.com
2. Verify all environment variables are set
3. Wait for backend to fully deploy (5-10 min)

### GitHub Pages showing 404?
1. Check Actions tab: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/actions
2. Make sure workflow completed successfully
3. Try changing Pages source to `/frontend/dist` if `/` doesn't work

### CORS errors in browser console?
1. Backend CORS is already configured
2. Make sure VITE_API_URL secret matches your actual Render URL
3. Rebuild: Go to Actions → Re-run workflow

---

## 📊 Cost Breakdown

| Service | Cost | What It Does |
|---------|------|--------------|
| Render (Backend) | **FREE** | Runs your Node.js API |
| GitHub Pages | **FREE** | Hosts your frontend |
| Supabase | **FREE** | Database |
| Gemini AI | **FREE** (limits apply) | AI processing |

**Total Monthly Cost: $0** 🎉

### To Upgrade (Remove 30s delay):
- Render Starter: $7/month
- Railway: $5/month
- Fly.io: $5/month

---

## ✅ Pre-Demo Checklist

Before showing to your boss:

- [ ] Backend deployed and showing green status on Render
- [ ] GitHub Actions workflow completed successfully
- [ ] GitHub Pages site loads at https://surajikf.github.io/Recruit-Suite-for-Remote-Recruitment
- [ ] Upload a test PDF resume to verify AI parsing works
- [ ] Create a sample job posting
- [ ] Check that matching engine works

---

## 🆘 Need Help?

### Check These:
1. **Render Dashboard**: https://dashboard.render.com - See backend status
2. **GitHub Actions**: https://github.com/surajikf/Recruit-Suite-for-Remote-Recruitment/actions - See build logs
3. **Browser Console**: F12 - See any JavaScript errors

### Common Issues:
- **"Failed to fetch"**: Backend not deployed yet or wrong URL
- **404 on upload**: VITE_API_URL secret not set correctly
- **Blank page**: Check GitHub Actions logs for build errors

---

Good luck with your demo! 🚀

