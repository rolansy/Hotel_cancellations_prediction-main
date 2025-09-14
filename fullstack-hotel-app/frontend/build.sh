#!/bin/bash

# Vercel Build Script
echo "🔨 Starting Vercel build process..."

# Set environment variables for production
export NODE_ENV=production
export VITE_API_URL=${VITE_API_URL:-"https://hotel-b-cancel-v3.onrender.com"}

echo "📦 Environment:"
echo "NODE_ENV: $NODE_ENV"
echo "VITE_API_URL: $VITE_API_URL"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --ignore-scripts

# Build with Vite (skip TypeScript type checking for now)
echo "🔨 Building with Vite..."
npx vite build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi
