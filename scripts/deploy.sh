#!/bin/bash

# Deployment script for fullstack-demo dashboard
set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build the application
echo "🔨 Building application..."
npm run build

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Display build info
echo "📊 Build Information:"
du -sh dist/
echo "Files in dist/:"
ls -la dist/

echo "🎉 Deployment ready!"
echo "📁 Build output: ./dist/"
echo "🌐 Serve with: npm run preview"
echo "🐳 Docker build: docker build -t fullstack-demo ."
echo "🚀 Deploy to: Vercel, Netlify, or GitHub Pages"

