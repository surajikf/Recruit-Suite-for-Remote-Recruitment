# Vercel Deployment Setup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Vercel Deployment Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create .env file in frontend
$envContent = @"
VITE_SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
VITE_API_URL=http://localhost:3001
"@

Set-Content -Path "frontend\.env" -Value $envContent
Write-Host "✓ Created frontend\.env file" -ForegroundColor Green

# Create .env.production file
$envProdContent = @"
VITE_SUPABASE_URL=https://czzpkrtlujpejuzhdnnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs
"@

Set-Content -Path "frontend\.env.production" -Value $envProdContent
Write-Host "✓ Created frontend\.env.production file" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: " -NoNewline
Write-Host "https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Click on your project (Recruit Suite)" -ForegroundColor White
Write-Host ""
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "4. Add these TWO variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Variable 1:" -ForegroundColor Cyan
Write-Host "   Name:  VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   Value: https://czzpkrtlujpejuzhdnnr.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "   Variable 2:" -ForegroundColor Cyan
Write-Host "   Name:  VITE_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs" -ForegroundColor White
Write-Host ""
Write-Host "   For BOTH variables:" -ForegroundColor Yellow
Write-Host "   - Check: Production ✓" -ForegroundColor Green
Write-Host "   - Check: Preview ✓" -ForegroundColor Green  
Write-Host "   - Check: Development ✓" -ForegroundColor Green
Write-Host ""
Write-Host "5. Click SAVE on each variable" -ForegroundColor Yellow
Write-Host ""
Write-Host "6. Go to Deployments tab" -ForegroundColor White
Write-Host ""
Write-Host "7. Click ... menu → Redeploy" -ForegroundColor White
Write-Host "   Uncheck 'Use existing Build Cache'" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Environment files created successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
