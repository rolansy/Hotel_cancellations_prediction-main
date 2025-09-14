# Hotel Booking Backend - Docker Setup

This guide explains how to run only the backend using Docker while keeping the frontend running locally.

## Prerequisites

- Docker Desktop installed and running
- The backend files in this directory

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start the backend
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the backend
docker-compose down
```

### Option 2: Using the Management Scripts

**Windows:**
```cmd
docker-manager.bat up    # Start the backend
docker-manager.bat logs  # View logs
docker-manager.bat stop  # Stop the backend
```

**Linux/Mac:**
```bash
chmod +x docker-manager.sh
./docker-manager.sh up    # Start the backend
./docker-manager.sh logs  # View logs
./docker-manager.sh stop  # Stop the backend
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t hotel-booking-backend .

# Run the container
docker run -d \
  --name hotel-booking-backend \
  -p 8000:8000 \
  -v $(pwd)/hotel_bookings.db:/app/hotel_bookings.db \
  hotel-booking-backend
```

## Access Points

Once the backend is running:

- **API Endpoint**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Redoc Documentation**: http://localhost:8000/redoc

## Frontend Configuration

Update your frontend to connect to the dockerized backend:

1. In your React app, ensure API calls point to `http://localhost:8000`
2. Start your frontend as usual:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Database Persistence

The SQLite database is mounted as a volume, so your data persists between container restarts.

## Troubleshooting

### Container won't start
```bash
# Check Docker is running
docker info

# Check logs
docker-compose logs backend
```

### Port already in use
```bash
# Stop any running containers
docker-compose down

# Or use a different port
docker run -p 8001:8000 hotel-booking-backend
```

### Database issues
```bash
# Reset database
docker-compose down
rm hotel_bookings.db
docker-compose up -d
```

## Development Workflow

1. Make changes to backend code
2. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## File Structure

```
backend/
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files to exclude from Docker build
├── docker-manager.sh       # Linux/Mac management script
├── docker-manager.bat      # Windows management script
├── requirements-clean.txt  # Clean Python dependencies
└── README-Docker.md        # This file
```

## Benefits of This Setup

✅ **Consistent Environment**: Backend runs in same environment everywhere
✅ **Easy Deployment**: Docker image can be deployed anywhere
✅ **Isolation**: Backend dependencies don't affect your local system
✅ **Quick Setup**: New developers can start with just `docker-compose up`
✅ **Development Flexibility**: Frontend still runs locally for fast development

## Production Considerations

For production deployment:

1. Use a proper database (PostgreSQL/MySQL) instead of SQLite
2. Set up proper environment variables for secrets
3. Use Docker secrets for sensitive data
4. Configure proper logging and monitoring
5. Use a reverse proxy (nginx) for SSL termination
