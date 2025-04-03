# Todo Application

A simple, responsive todo application built with React featuring task management and filtering capabilities.

## Features

- Add, edit, and delete tasks
- Mark tasks as complete
- Filter tasks by status (All, Active, Completed)
- Persistent storage using PostgreSQL database
- Responsive design for mobile and desktop
- Docker support for easy deployment
- Google Cloud Run deployment configuration

## Running with Docker

This application is containerized with Docker for easy deployment and portability.

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone this repository
2. Navigate to the project directory
3. Run the application using Docker Compose:

```bash
docker-compose up
```

The application will be available at http://localhost:8080

### Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

To stop the application and remove all data (including the database volume), use:

```bash
docker-compose down -v
```

### Troubleshooting Docker Setup

If you encounter issues with the Docker setup, try the following steps:

#### Connection Issues (localhost refused to connect)

1. Make sure Docker is running correctly:
   ```bash
   docker ps
   ```

2. Use the provided debug script to diagnose issues:
   ```bash
   ./docker-debug.sh
   ```
   
3. Alternative startup with verbose logging:
   ```bash
   ./docker-start.sh
   ```

#### Common Issues and Solutions

1. **Port conflicts**: Make sure port 8080 is not already in use by another application.

2. **Docker networking issues**: Try rebuilding the Docker images with:
   ```bash
   docker-compose down --volumes
   docker-compose up --build
   ```

3. **Database connection errors**: Check if the database is running and accessible:
   ```bash
   docker-compose exec db psql -U postgres -c "SELECT 1"
   ```

4. **Container not starting**: Check the logs for errors:
   ```bash
   docker-compose logs app
   ```

## Development

For local development without Docker:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Database

The application uses PostgreSQL for data persistence. The database schema is automatically initialized on first run.

## Deploying to Google Cloud Run

This application can be deployed to Google Cloud Run for serverless container deployment.

### Prerequisites

- Google Cloud account with billing enabled
- Google Cloud SDK installed and configured
- Docker installed
- Access to Google Container Registry or Artifact Registry
- A PostgreSQL database instance (Cloud SQL or other managed service)

### Deployment Steps

#### Option 1: Using the Deployment Script

1. Update the `cloud-deploy.sh` script with your Google Cloud project ID and other configuration details:

```bash
# Edit the script
nano cloud-deploy.sh

# Make it executable
chmod +x cloud-deploy.sh

# Run the deployment script
./cloud-deploy.sh
```

#### Option 2: Using Cloud Build

1. Configure your Google Cloud project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

2. Enable required APIs:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

3. Trigger a build and deployment:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

#### Database Configuration

For production deployments, you should use a managed PostgreSQL database service such as Google Cloud SQL:

1. Create a Cloud SQL PostgreSQL instance:

```bash
gcloud sql instances create todo-app-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

2. Create a database and user:

```bash
gcloud sql databases create todoapp --instance=todo-app-postgres

gcloud sql users create todouser \
  --instance=todo-app-postgres \
  --password=YOUR_SECURE_PASSWORD
```

3. Get the connection string and update your Cloud Run service:

```bash
gcloud run services update todo-app \
  --update-env-vars DATABASE_URL=postgres://todouser:YOUR_SECURE_PASSWORD@IP_ADDRESS/todoapp
```

## Environment Variables

The following environment variables can be set in the deployment environment:

- `DATABASE_URL`: PostgreSQL connection string
- `PGUSER`: PostgreSQL username
- `PGHOST`: PostgreSQL host
- `PGPASSWORD`: PostgreSQL password
- `PGDATABASE`: PostgreSQL database name
- `PGPORT`: PostgreSQL port
- `NODE_ENV`: Node environment (development or production)

## License

MIT