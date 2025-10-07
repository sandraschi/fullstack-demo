# Service Manager for Fullstack Demo
# Manages all AI services with start/stop functionality

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "restart", "cleanup")]
    [string]$Action
)

$services = @{
    "frontend" = @{
        "name" = "Frontend Dashboard"
        "port" = 5173
        "command" = "npm run dev"
        "process" = "node"
        "shutdown_url" = $null
    }
    "backend" = @{
        "name" = "Backend API"
        "port" = 9200
        "command" = "node gradio-backend.cjs"
        "process" = "node"
        "shutdown_url" = "http://localhost:9200/shutdown"
    }
    "gradio" = @{
        "name" = "Gradio Image Generator"
        "port" = 7860
        "command" = "python gradio-image-generator.py"
        "process" = "python"
        "shutdown_url" = "http://localhost:7860/shutdown"
    }
    "tts" = @{
        "name" = "TTS Server"
        "port" = 8001
        "command" = "python tts-server.py"
        "process" = "python"
        "shutdown_url" = "http://localhost:8001/shutdown"
    }
    "whisper" = @{
        "name" = "Whisper STT Server"
        "port" = 8002
        "command" = "python whisper-server.py"
        "process" = "python"
        "shutdown_url" = "http://localhost:8002/shutdown"
    }
}

function Get-ProcessOnPort {
    param([int]$Port)
    $process = netstat -ano | Select-String ":$Port " | ForEach-Object {
        $parts = $_ -split '\s+'
        if ($parts.Length -ge 5) {
            $pid = $parts[4]
            Get-Process -Id $pid -ErrorAction SilentlyContinue
        }
    }
    return $process
}

function Stop-Service {
    param([string]$ServiceKey)
    
    $service = $services[$ServiceKey]
    Write-Host "Stopping $($service.name)..." -ForegroundColor Yellow
    
    # Try API shutdown first
    if ($service.shutdown_url) {
        try {
            $response = Invoke-RestMethod -Uri $service.shutdown_url -Method POST -TimeoutSec 5
            Write-Host "✓ $($service.name) shutdown via API" -ForegroundColor Green
            Start-Sleep -Seconds 2
            return
        } catch {
            Write-Host "API shutdown failed, trying process kill..." -ForegroundColor Yellow
        }
    }
    
    # Fallback to process kill
    $process = Get-ProcessOnPort -Port $service.port
    if ($process) {
        try {
            $process.Kill()
            Write-Host "✓ $($service.name) stopped (PID: $($process.Id))" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to stop $($service.name)" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ $($service.name) not running on port $($service.port)" -ForegroundColor Red
    }
}

function Start-Service {
    param([string]$ServiceKey)
    
    $service = $services[$ServiceKey]
    Write-Host "Starting $($service.name)..." -ForegroundColor Cyan
    
    # Check if already running
    $process = Get-ProcessOnPort -Port $service.port
    if ($process) {
        Write-Host "✓ $($service.name) already running (PID: $($process.Id))" -ForegroundColor Green
        return
    }
    
    # Start the service
    try {
        Start-Process -FilePath "powershell" -ArgumentList "-Command", $service.command -WindowStyle Minimized
        Start-Sleep -Seconds 3
        
        # Verify it started
        $newProcess = Get-ProcessOnPort -Port $service.port
        if ($newProcess) {
            Write-Host "✓ $($service.name) started successfully (PID: $($newProcess.Id))" -ForegroundColor Green
        } else {
            Write-Host "✗ $($service.name) failed to start" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Failed to start $($service.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-ServiceStatus {
    Write-Host "`n=== Service Status ===" -ForegroundColor Magenta
    
    foreach ($serviceKey in $services.Keys) {
        $service = $services[$serviceKey]
        $process = Get-ProcessOnPort -Port $service.port
        
        if ($process) {
            Write-Host "✓ $($service.name) - Running (PID: $($process.Id), Port: $($service.port))" -ForegroundColor Green
        } else {
            Write-Host "✗ $($service.name) - Stopped (Port: $($service.port))" -ForegroundColor Red
        }
    }
    
    Write-Host "`n=== External Services ===" -ForegroundColor Magenta
    
    # Check Ollama
    $ollamaProcess = Get-ProcessOnPort -Port 11434
    if ($ollamaProcess) {
        Write-Host "✓ Ollama - Running (PID: $($ollamaProcess.Id), Port: 11434)" -ForegroundColor Green
    } else {
        Write-Host "✗ Ollama - Stopped (Port: 11434)" -ForegroundColor Red
    }
    
    # Check LM Studio
    $lmStudioProcess = Get-ProcessOnPort -Port 1234
    if ($lmStudioProcess) {
        Write-Host "✓ LM Studio - Running (PID: $($lmStudioProcess.Id), Port: 1234)" -ForegroundColor Green
    } else {
        Write-Host "✗ LM Studio - Stopped (Port: 1234)" -ForegroundColor Red
    }
}

switch ($Action) {
    "start" {
        Write-Host "Starting all services..." -ForegroundColor Cyan
        foreach ($serviceKey in $services.Keys) {
            Start-Service -ServiceKey $serviceKey
        }
        Write-Host "`nAll services started!" -ForegroundColor Green
    }
    
    "stop" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        foreach ($serviceKey in $services.Keys) {
            Stop-Service -ServiceKey $serviceKey
        }
        Write-Host "`nAll services stopped!" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor Cyan
        foreach ($serviceKey in $services.Keys) {
            Stop-Service -ServiceKey $serviceKey
            Start-Sleep -Seconds 2
            Start-Service -ServiceKey $serviceKey
        }
        Write-Host "`nAll services restarted!" -ForegroundColor Green
    }
    
    "cleanup" {
        Write-Host "Cleaning up leftover services..." -ForegroundColor Yellow
        $shutdownUrls = @(
            "http://localhost:9200/shutdown",  # Backend
            "http://localhost:8001/shutdown",  # TTS
            "http://localhost:8002/shutdown",  # Whisper
            "http://localhost:7860/shutdown"   # Gradio
        )
        
        foreach ($url in $shutdownUrls) {
            try {
                Write-Host "Cleaning up $url..." -ForegroundColor Cyan
                $response = Invoke-RestMethod -Uri $url -Method POST -TimeoutSec 3
                Write-Host "✓ Cleaned up $url" -ForegroundColor Green
            } catch {
                Write-Host "- No service running at $url" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nCleanup complete! Ready for fresh startup." -ForegroundColor Green
    }
    
    "status" {
        Get-ServiceStatus
    }
}

Write-Host "`n=== Quick Access ===" -ForegroundColor Magenta
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "API Gateway: http://localhost:9200" -ForegroundColor White
Write-Host "Gradio App: http://localhost:7860" -ForegroundColor White
Write-Host "TTS Server: http://localhost:8001" -ForegroundColor White
Write-Host "Whisper Server: http://localhost:8002" -ForegroundColor White
Write-Host "Ollama: http://localhost:11434" -ForegroundColor White
Write-Host "LM Studio: http://localhost:1234" -ForegroundColor White
