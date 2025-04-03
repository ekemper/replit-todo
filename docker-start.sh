#!/bin/bash

# Clean up previous containers
echo "Cleaning up previous containers..."
docker-compose down

# Rebuild and start containers with verbose output
echo "Building and starting containers..."
docker-compose up --build -d

# Monitor the logs
echo "Monitoring logs (press Ctrl+C to stop watching)..."
docker-compose logs -f