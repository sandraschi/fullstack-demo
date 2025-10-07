# Shutdown All Services Script
# Gracefully shuts down all AI services without UAC prompts

Write-Host "Shutting down all AI services..." -ForegroundColor Yellow

# Shutdown endpoints
$shutdownUrls = @(
    "http://localhost:9200/shutdown",  # Backend
    "http://localhost:8001/shutdown",  # TTS
    "http://localhost:8002/shutdown",  # Whisper
    "http://localhost:7860/shutdown"   # Gradio
)

foreach ($url in $shutdownUrls) {
    try {
        Write-Host "Shutting down $url..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri $url -Method POST -TimeoutSec 5
        Write-Host "✓ $response" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to shutdown $url (may not be running)" -ForegroundColor Red
    }
}

# Kill any remaining processes on our ports
$ports = @(5173, 9200, 7860, 8001, 8002)

foreach ($port in $ports) {
    $process = netstat -ano | Select-String ":$port " | ForEach-Object {
        $parts = $_ -split '\s+'
        if ($parts.Length -ge 5) {
            $pid = $parts[4]
            Get-Process -Id $pid -ErrorAction SilentlyContinue
        }
    }
    
    if ($process) {
        try {
            $process.Kill()
            Write-Host "✓ Killed process on port $port (PID: $($process.Id))" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to kill process on port $port" -ForegroundColor Red
        }
    }
}

Write-Host "`nAll services shutdown complete!" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
