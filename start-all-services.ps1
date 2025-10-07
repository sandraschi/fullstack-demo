# Auto-Start All Services Script
# Starts all AI services after dashboard cleanup

Write-Host "Starting all AI services..." -ForegroundColor Cyan

# Service definitions
$services = @(
    @{
        name = "Backend API"
        command = "node gradio-backend.cjs"
        port = 9200
        url = "http://localhost:9200/api/health"
    },
    @{
        name = "Gradio Image Generator"
        command = "python gradio-image-generator.py"
        port = 7860
        url = "http://localhost:7860"
    },
    @{
        name = "TTS Server"
        command = "python tts-server.py"
        port = 8001
        url = "http://localhost:8001"
    },
    @{
        name = "Whisper STT Server"
        command = "python whisper-server.py"
        port = 8002
        url = "http://localhost:8002"
    }
)

# Start each service
foreach ($service in $services) {
    Write-Host "Starting $($service.name)..." -ForegroundColor Yellow
    
    try {
        # Start the service in a minimized window
        Start-Process -FilePath "powershell" -ArgumentList "-Command", $service.command -WindowStyle Minimized
        Start-Sleep -Seconds 3
        
        # Check if it started successfully
        try {
            $response = Invoke-WebRequest -Uri $service.url -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✓ $($service.name) started successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠ $($service.name) started but may not be ready yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Failed to start $($service.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Service Status ===" -ForegroundColor Magenta
Start-Sleep -Seconds 2

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.url -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✓ $($service.name) - Online" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($service.name) - Offline" -ForegroundColor Red
    }
}

Write-Host "`n=== Quick Access ===" -ForegroundColor Magenta
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "API Gateway: http://localhost:9200" -ForegroundColor White
Write-Host "Gradio App: http://localhost:7860" -ForegroundColor White
Write-Host "TTS Server: http://localhost:8001" -ForegroundColor White
Write-Host "Whisper Server: http://localhost:8002" -ForegroundColor White

Write-Host "`nAll services started! Dashboard will clean up any leftover processes on next startup." -ForegroundColor Green
