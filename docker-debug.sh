#!/bin/bash

echo "=============== Docker Debug Script ==============="
echo "Checking Docker container status..."

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in path."
    exit 1
fi

# Get the app container ID
CONTAINER_ID=$(docker ps -qf "name=todo-app" || docker ps -qf "ancestor=todo-app")

if [ -z "$CONTAINER_ID" ]; then
    echo "No running container found for the todo app."
    echo "Let's check all containers:"
    docker ps -a
    
    echo "\nStarting docker-compose again..."
    docker-compose down
    docker-compose up -d
    
    echo "\nWaiting for containers to start..."
    sleep 10
    
    CONTAINER_ID=$(docker ps -qf "name=todo-app" || docker ps -qf "ancestor=todo-app")
    
    if [ -z "$CONTAINER_ID" ]; then
        echo "Still no container found. Check docker-compose.yml for issues."
        exit 1
    fi
fi

echo "\nApplication container found: $CONTAINER_ID"

# Check container logs
echo "\n=============== Container Logs ==============="
docker logs $CONTAINER_ID

# Check network connections
echo "\n=============== Network Connections ==============="
docker exec $CONTAINER_ID netstat -tuln

# Check if the application is listening on port 8080
echo "\n=============== Port 8080 Status ==============="
docker exec $CONTAINER_ID curl -v http://localhost:8080/

# Check container environment variables
echo "\n=============== Environment Variables ==============="
docker exec $CONTAINER_ID env | grep -v PASSWORD

# Check file structure in container
echo "\n=============== Container File Structure ==============="
docker exec $CONTAINER_ID ls -la /app
docker exec $CONTAINER_ID ls -la /app/dist

echo "\n=============== Debug Complete ==============="
echo "If you're still having issues, try the following:"
echo "1. Make sure port 8080 is not being used by another application"
echo "2. Try accessing http://localhost:8080 (not https)"
echo "3. Check your browser console for any errors"
echo "4. Try using docker-compose down --volumes && docker-compose up --build"