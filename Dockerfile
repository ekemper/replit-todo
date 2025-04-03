FROM node:20-slim

WORKDIR /app

# Install curl for healthcheck and debugging tools
RUN apt-get update && apt-get install -y curl procps net-tools && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Debugging: List build output
RUN ls -la dist/

# Expose the application port
EXPOSE 8080

# Healthcheck to verify app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/tasks || exit 1

# Start the application with debugging information
CMD ["sh", "-c", "echo 'Current working directory:' && pwd && ls -la && echo 'Environment:' && env | grep -v PASSWORD && echo 'Starting database initialization...' && node init-db.js && echo 'Starting application...' && echo 'The application should be accessible at:' && echo '- http://localhost:8080' && echo '- http://localhost:3000' && echo '- http://<docker-ip>:8080' && echo '- http://<docker-ip>:3000' && npm run start"]