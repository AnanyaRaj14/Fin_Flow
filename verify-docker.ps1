# FinFlow Docker Verification Script
# Run this in PowerShell: .\verify-docker.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FinFlow Docker Verification Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "[1/8] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Step 2: Check Docker Compose
Write-Host "`n[2/8] Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not available" -ForegroundColor Red
    exit 1
}

# Step 3: Validate Configuration
Write-Host "`n[3/8] Validating docker-compose.yml..." -ForegroundColor Yellow
docker compose config --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuration valid" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration has errors" -ForegroundColor Red
    exit 1
}

# Step 4: Check .env file
Write-Host "`n[4/8] Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $required = @("POSTGRES_PASSWORD", "JWT_SECRET", "SMTP_HOST", "CLOUDINARY_CLOUD_NAME")
    $missing = @()
    
    foreach ($var in $required) {
        if ($envContent -notmatch $var) {
            $missing += $var
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "✅ All required environment variables present" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Missing variables: $($missing -join ', ')" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Check port availability
Write-Host "`n[5/8] Checking port availability..." -ForegroundColor Yellow
$ports = @(5432, 5000, 3001)
$busy = @()

foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port "
    if ($connections) {
        $busy += $port
    }
}

if ($busy.Count -eq 0) {
    Write-Host "✅ All ports available (5432, 5000, 3001)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ports in use: $($busy -join ', ')" -ForegroundColor Yellow
    Write-Host "   This may be from running Docker containers or local services" -ForegroundColor Gray
}

# Step 6: Build images
Write-Host "`n[6/8] Building Docker images..." -ForegroundColor Yellow
Write-Host "   (This may take 5-10 minutes on first build)" -ForegroundColor Gray

docker compose build --progress=plain 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All images built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Check logs with: docker compose build" -ForegroundColor Red
    Write-Host "`nShowing last 30 lines of build output:" -ForegroundColor Yellow
    docker compose build 2>&1 | Select-Object -Last 30
    exit 1
}

# Step 7: Start services
Write-Host "`n[7/8] Starting services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`n   Waiting for services to be healthy (30 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Step 8: Check service status
Write-Host "`n[8/8] Checking service health..." -ForegroundColor Yellow
$status = docker compose ps

Write-Host "`n$status`n" -ForegroundColor White

# Check each service
$services = @("finflow_db", "finflow_server", "finflow_client")
$allHealthy = $true

foreach ($service in $services) {
    $containerStatus = docker inspect $service --format='{{.State.Status}}' 2>$null
    
    if ($containerStatus -eq "running") {
        Write-Host "✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is $containerStatus" -ForegroundColor Red
        $allHealthy = $false
    }
}

# Test endpoints
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test Server Health
Write-Host "Testing server health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server API responding: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server API not responding" -ForegroundColor Red
    $allHealthy = $false
}

# Test Client
Write-Host "`nTesting client frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Client frontend responding" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Client frontend not responding" -ForegroundColor Red
    $allHealthy = $false
}

# Test Database
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
$dbTest = docker exec finflow_db psql -U postgres -d finflow -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Database not accessible" -ForegroundColor Red
    $allHealthy = $false
}

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "🎉 SUCCESS! Your Docker setup is working perfectly!" -ForegroundColor Green
    Write-Host "`nYou can now:" -ForegroundColor White
    Write-Host "  • Open http://localhost:3001 in your browser" -ForegroundColor Gray
    Write-Host "  • Register/login to test the full application" -ForegroundColor Gray
    Write-Host "  • View logs: docker compose logs -f" -ForegroundColor Gray
    Write-Host "  • Stop services: docker compose down" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some issues detected. Check the logs:" -ForegroundColor Yellow
    Write-Host "  docker compose logs" -ForegroundColor Gray
    Write-Host "`nCommon fixes:" -ForegroundColor White
    Write-Host "  • Restart: docker compose restart" -ForegroundColor Gray
    Write-Host "  • Rebuild: docker compose down && docker compose up --build -d" -ForegroundColor Gray
}

Write-Host "`n"
