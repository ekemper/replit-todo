#!/bin/bash

echo "==============================================="
echo "Docker Container Connection Test"
echo "==============================================="

# Function to test a URL with curl
test_url() {
    local url=$1
    local description=$2
    echo -e "\n🔍 Testing $description: $url"
    curl -s -o /dev/null -w "Status: %{http_code}, Response time: %{time_total}s\n" "$url" || echo "❌ Failed to connect"
}

# Get the app container ID
CONTAINER_ID=$(docker ps -qf "name=todo-app" || docker ps -qf "ancestor=todo-app")

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ No running container found for the todo app."
    echo "Try running docker-compose up first."
    exit 1
fi

echo "✅ Found container with ID: $CONTAINER_ID"

# Get container IP address
CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $CONTAINER_ID)
echo "🖥️ Container IP address: $CONTAINER_IP"

# Get host machine IP
HOST_IP=$(hostname -I | awk '{print $1}')
echo "🖥️ Host machine IP: $HOST_IP"

echo -e "\n==============================================="
echo "Testing all possible connection methods..."
echo "==============================================="

# Test localhost connections
test_url "http://localhost:8080/" "localhost:8080"
test_url "http://localhost:3000/" "localhost:3000 (alternative port)"
test_url "http://127.0.0.1:8080/" "127.0.0.1:8080 (explicit loopback)"
test_url "http://127.0.0.1:3000/" "127.0.0.1:3000 (explicit loopback, alternative port)"

# Test container IP
test_url "http://$CONTAINER_IP:8080/" "direct container IP"

# Test special Docker hostnames
test_url "http://host.docker.internal:8080/" "host.docker.internal (Docker host DNS name)"

# If on Linux, try connecting via the docker0 interface IP
if [ -n "$(ip addr show docker0 2>/dev/null)" ]; then
    DOCKER0_IP=$(ip addr show docker0 | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*')
    if [ -n "$DOCKER0_IP" ]; then
        echo -e "\n🖥️ Docker bridge IP: $DOCKER0_IP"
        test_url "http://$DOCKER0_IP:8080/" "Docker bridge interface"
    fi
fi

echo -e "\n==============================================="
echo "Checking if the application server is running inside the container"
echo "==============================================="
docker exec $CONTAINER_ID curl -s -o /dev/null -w "Internal connection status: %{http_code}\n" http://localhost:8080/ || echo "❌ The server is NOT running correctly inside the container"

echo -e "\n==============================================="
echo "Possible Solutions"
echo "==============================================="
echo "If all tests failed, try these solutions:"
echo "1. Restart Docker completely (docker-compose down && docker-compose up -d)"
echo "2. Check if any other application is using ports 8080 or 3000"
echo "3. Try accessing via the container IP directly: http://$CONTAINER_IP:8080"
echo "4. Check your firewall/antivirus settings"
echo "5. For Windows/Mac, check Docker Desktop settings > Resources > Network"
echo "6. Try completely rebuilding: docker-compose down --volumes && docker-compose up --build -d"