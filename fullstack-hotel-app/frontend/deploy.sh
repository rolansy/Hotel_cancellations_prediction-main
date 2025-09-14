#!/bin/bash

# Hotel Booking Frontend Deployment Script

echo "🚀 Deploying Hotel Booking Frontend to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in: dist/"
    echo "🌐 Ready for deployment to Vercel"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git add . && git commit -m 'Deploy to Vercel' && git push"
    echo "2. Vercel will automatically deploy from main branch"
    echo "3. Check deployment at: https://vercel.com/dashboard"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
