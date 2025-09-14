@echo off
REM Hotel Booking Backend Docker Management Script for Windows

echo Hotel Booking Backend Docker Manager
echo ====================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

if "%1"=="build" goto build
if "%1"=="run" goto run
if "%1"=="up" goto up
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
goto usage

:build
echo Building Docker image...
docker build -t hotel-booking-backend .
if %errorlevel% equ 0 (
    echo ✅ Docker image built successfully!
) else (
    echo ❌ Failed to build Docker image.
    pause
    exit /b 1
)
goto end

:run
echo Building and starting Docker container...
call :build
docker run -d --name hotel-booking-backend -p 8000:8000 -v "%cd%\hotel_bookings.db:/app/hotel_bookings.db" hotel-booking-backend
if %errorlevel% equ 0 (
    echo ✅ Backend is running on http://localhost:8000
    echo 📚 API Documentation: http://localhost:8000/docs
) else (
    echo ❌ Failed to start container.
    pause
    exit /b 1
)
goto end

:up
echo Starting with docker-compose...
docker-compose up -d
if %errorlevel% equ 0 (
    echo ✅ Backend is running on http://localhost:8000
    echo 📚 API Documentation: http://localhost:8000/docs
) else (
    echo ❌ Failed to start with docker-compose.
    pause
    exit /b 1
)
goto end

:stop
echo Stopping Docker container...
docker stop hotel-booking-backend >nul 2>&1
docker rm hotel-booking-backend >nul 2>&1
docker-compose down >nul 2>&1
echo ✅ Backend stopped.
goto end

:restart
call :stop
timeout /t 2 /nobreak >nul
call :up
goto end

:logs
echo Showing container logs...
docker logs -f hotel-booking-backend 2>nul || docker-compose logs -f backend
goto end

:status
echo Container Status:
docker ps --filter "name=hotel-booking-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo Health Check:
curl -s http://localhost:8000/docs >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ❌ Backend is not responding
)
goto end

:usage
echo Usage: %0 {build^|run^|up^|stop^|restart^|logs^|status}
echo.
echo Commands:
echo   build   - Build the Docker image
echo   run     - Build and run container directly
echo   up      - Start with docker-compose
echo   stop    - Stop the container
echo   restart - Restart the container
echo   logs    - View container logs
echo   status  - Show container status
echo.
echo Quick start:
echo   %0 up     # Start the backend
echo   %0 logs   # View logs
echo   %0 stop   # Stop the backend
pause
exit /b 1

:end
pause
