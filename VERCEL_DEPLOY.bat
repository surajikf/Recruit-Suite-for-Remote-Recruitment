@echo off
echo ================================
echo Deploying to Vercel...
echo ================================
echo.

cd frontend

echo Installing dependencies...
call npm install
echo.

echo Building project...
call npm run build
echo.

echo.
echo ================================
echo BUILD COMPLETE!
echo ================================
echo.
echo Now go to Vercel Dashboard:
echo 1. https://vercel.com/dashboard
echo 2. Click on your project
echo 3. Go to Settings - Environment Variables
echo 4. Add these variables:
echo.
echo    VITE_SUPABASE_URL = https://czzpkrtlujpejuzhdnnr.supabase.co
echo    VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
echo.
echo 5. Click Deployments tab
echo 6. Click ... menu - Redeploy
echo.
echo ================================
echo.
pause
