@echo off
REM Hotel Booking Frontend Deployment Script for Windows

echo 🚀 Deploying Hotel Booking Frontend to Vercel...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

REM Type check
echo 🔍 Running type check...
npm run type-check
if %errorlevel% neq 0 (
    echo ⚠️ Type check failed, but continuing with build...
)

REM Build the project
echo 🔨 Building project...
npm run build
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo 📁 Build output in: dist/
    echo 🌐 Ready for deployment to Vercel
    echo.
    echo Next steps:
    echo 1. Push to GitHub: git add . ^&^& git commit -m "Deploy to Vercel" ^&^& git push
    echo 2. Vercel will automatically deploy from main branch
    echo 3. Check deployment at: https://vercel.com/dashboard
) else (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

pause
