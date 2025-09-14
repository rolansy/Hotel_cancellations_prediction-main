#!/bin/bash

# Hotel Booking Backend Docker Management Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Hotel Booking Backend Docker Manager${NC}"
echo "===================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
}

# Function to build the Docker image
build() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -t hotel-booking-backend .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image.${NC}"
        exit 1
    fi
}

# Function to run the container
run() {
    echo -e "${YELLOW}Starting Docker container...${NC}"
    docker run -d \
        --name hotel-booking-backend \
        -p 8000:8000 \
        -v $(pwd)/hotel_bookings.db:/app/hotel_bookings.db \
        hotel-booking-backend
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
        echo -e "${GREEN}📚 API Documentation: http://localhost:8000/docs${NC}"
    else
        echo -e "${RED}❌ Failed to start container.${NC}"
        exit 1
    fi
}

# Function to run with docker-compose
compose_up() {
    echo -e "${YELLOW}Starting with docker-compose...${NC}"
    docker-compose up -d
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
        echo -e "${GREEN}📚 API Documentation: http://localhost:8000/docs${NC}"
    else
        echo -e "${RED}❌ Failed to start with docker-compose.${NC}"
        exit 1
    fi
}

# Function to stop the container
stop() {
    echo -e "${YELLOW}Stopping Docker container...${NC}"
    docker stop hotel-booking-backend 2>/dev/null || docker-compose down
    docker rm hotel-booking-backend 2>/dev/null
    echo -e "${GREEN}✅ Backend stopped.${NC}"
}

# Function to view logs
logs() {
    echo -e "${YELLOW}Showing container logs...${NC}"
    docker logs -f hotel-booking-backend 2>/dev/null || docker-compose logs -f backend
}

# Function to restart
restart() {
    stop
    sleep 2
    compose_up
}

# Function to show status
status() {
    echo -e "${YELLOW}Container Status:${NC}"
    docker ps --filter "name=hotel-booking-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${YELLOW}Health Check:${NC}"
    curl -s http://localhost:8000/docs > /dev/null && echo -e "${GREEN}✅ Backend is healthy${NC}" || echo -e "${RED}❌ Backend is not responding${NC}"
}

# Main script logic
case "${1}" in
    build)
        check_docker
        build
        ;;
    run)
        check_docker
        build
        run
        ;;
    up)
        check_docker
        compose_up
        ;;
    stop)
        stop
        ;;
    restart)
        check_docker
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {build|run|up|stop|restart|logs|status}"
        echo ""
        echo "Commands:"
        echo "  build   - Build the Docker image"
        echo "  run     - Build and run container directly"
        echo "  up      - Start with docker-compose"
        echo "  stop    - Stop the container"
        echo "  restart - Restart the container"
        echo "  logs    - View container logs"
        echo "  status  - Show container status"
        echo ""
        echo "Quick start:"
        echo "  $0 up     # Start the backend"
        echo "  $0 logs   # View logs"
        echo "  $0 stop   # Stop the backend"
        exit 1
        ;;
esac
