# Deployment script for fullstack-demo dashboard (PowerShell)
param(
    [switch]$SkipTests,
    [switch]$Docker,
    [string]$Environment = "production"
)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    npm run test:run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Tests failed" -ForegroundColor Red
        exit 1
    }
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    exit 1
}

# Check build output
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Display build info
Write-Host "📊 Build Information:" -ForegroundColor Cyan
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Dist size: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
Write-Host "Files in dist/:" -ForegroundColor White
Get-ChildItem -Path "dist" | Format-Table Name, Length, LastWriteTime

# Docker build (if requested)
if ($Docker) {
    Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
    docker build -t fullstack-demo:$Environment .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Docker build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
}

Write-Host "🎉 Deployment ready!" -ForegroundColor Green
Write-Host "📁 Build output: ./dist/" -ForegroundColor White
Write-Host "🌐 Serve with: npm run preview" -ForegroundColor White
Write-Host "🐳 Docker run: docker run -p 3000:80 fullstack-demo:$Environment" -ForegroundColor White
Write-Host "🚀 Deploy to: Vercel, Netlify, or GitHub Pages" -ForegroundColor White

