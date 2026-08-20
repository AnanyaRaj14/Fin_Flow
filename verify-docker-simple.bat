@echo off
REM FinFlow Docker Quick Verification
REM Run this: verify-docker-simple.bat

echo.
echo ========================================
echo   FinFlow Docker Quick Test
echo ========================================
echo.

echo [1/5] Validating configuration...
docker compose config --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: docker-compose.yml has errors
    pause
    exit /b 1
)
echo OK: Configuration valid
echo.

echo [2/5] Building images (may take 5-10 min)...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo OK: Build successful
echo.

echo [3/5] Starting services...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start
    pause
    exit /b 1
)
echo OK: Services started
echo.

echo [4/5] Waiting 30 seconds for services...
timeout /t 30 /nobreak >nul
echo.

echo [5/5] Checking status...
docker compose ps
echo.

echo Testing endpoints...
echo.
curl -s http://localhost:5000/api/health
echo.
echo.

echo ========================================
echo   Verification Complete!
echo ========================================
echo.
echo Open in browser: http://localhost:3001
echo View logs: docker compose logs -f
echo Stop: docker compose down
echo.
pause
