#!/bin/bash

echo "=============== Docker Debug Script ==============="
echo "Checking Docker container status..."

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in path."
    exit 1
fi

# Get Docker info
echo "=============== Docker Info ==============="
docker info

# List all running containers
echo "=============== Running Containers ==============="
docker ps

# Get the app container ID
CONTAINER_ID=$(docker ps -qf "name=todo-app" || docker ps -qf "ancestor=todo-app")

if [ -z "$CONTAINER_ID" ]; then
    echo "No running container found for the todo app."
    echo "Let's check all containers (including stopped ones):"
    docker ps -a
    
    echo -e "\nStarting docker-compose again..."
    docker-compose down
    docker-compose up -d
    
    echo -e "\nWaiting for containers to start..."
    sleep 10
    
    CONTAINER_ID=$(docker ps -qf "name=todo-app" || docker ps -qf "ancestor=todo-app")
    
    if [ -z "$CONTAINER_ID" ]; then
        echo "Still no container found. Check docker-compose.yml for issues."
        exit 1
    fi
fi

echo -e "\nApplication container found: $CONTAINER_ID"

# Check Docker networks
echo -e "\n=============== Docker Networks ==============="
docker network ls
echo -e "\nNetwork details:"
docker network inspect bridge

# Get container IP address
CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $CONTAINER_ID)
echo -e "\nContainer IP address: $CONTAINER_IP"

# Check container logs
echo -e "\n=============== Container Logs ==============="
docker logs $CONTAINER_ID

# Check network connections
echo -e "\n=============== Network Connections (in container) ==============="
docker exec $CONTAINER_ID netstat -tuln

# Check if the application is listening on port 8080
echo -e "\n=============== Port 8080 Status (inside container) ==============="
docker exec $CONTAINER_ID curl -v http://localhost:8080/ || echo "Failed to connect to localhost:8080 inside container"

# Try connecting from host to container IP
echo -e "\n=============== Try connecting to container IP ==============="
echo "Attempting to connect to http://$CONTAINER_IP:8080"
curl -v http://$CONTAINER_IP:8080/ || echo "Failed to connect to container IP"

# Check for port bindings on the host
echo -e "\n=============== Host Port Bindings ==============="
netstat -tuln | grep 8080
netstat -tuln | grep 3000

# Check container environment variables
echo -e "\n=============== Environment Variables ==============="
docker exec $CONTAINER_ID env | grep -v PASSWORD

# Check file structure in container
echo -e "\n=============== Container File Structure ==============="
docker exec $CONTAINER_ID ls -la /app
docker exec $CONTAINER_ID ls -la /app/dist

echo -e "\n=============== Alternative Access Points ==============="
echo "Please try accessing the application using these URLs:"
echo "1. http://localhost:8080"
echo "2. http://localhost:3000 (alternative port)"
echo "3. http://$CONTAINER_IP:8080 (direct container IP)"
echo "4. http://127.0.0.1:8080 (explicit loopback address)"
echo "5. http://host.docker.internal:8080 (Docker host special DNS name)"

echo -e "\n=============== Debug Complete ==============="
echo "If you're still having issues, try the following:"
echo "1. Make sure ports 8080 and 3000 are not being used by another application"
echo "2. Try accessing with 'http://' not 'https://'"
echo "3. Try disabling any firewalls or VPNs temporarily"
echo "4. Complete system restart (both Docker and your computer)"
echo "5. Try this command to rebuild everything: docker-compose down --volumes && docker-compose up --build"
echo -e "\nIf using Docker Desktop on Windows/Mac:"
echo "- Check Docker Desktop settings > Resources > Network (make sure port forwarding is enabled)"
echo "- Try restarting the Docker Desktop application"