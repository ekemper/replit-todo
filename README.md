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

2. Try the comprehensive connection testing script (tests all access methods):
   ```bash
   ./docker-connection-test.sh
   ```

3. Use the provided debug script for detailed diagnostics:
   ```bash
   ./docker-debug.sh
   ```
   
4. Alternative startup with verbose logging:
   ```bash
   ./docker-start.sh
   ```

5. Try accessing the application using alternative URLs:
   - http://localhost:8080 (primary URL)
   - http://localhost:3000 (alternative port)
   - http://127.0.0.1:8080 (explicit loopback address)
   - http://[container-ip]:8080 (direct container IP, get from docker-connection-test.sh)

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

#### Option 3: Using Pulumi (Infrastructure as Code)

This repository includes a Pulumi project for deploying the application using Infrastructure as Code principles.

1. Navigate to the Pulumi directory:

```bash
cd pulumi
```

2. Make sure you have the Pulumi CLI installed.

3. Configure your Google Cloud project ID in `Pulumi.dev.yaml`:

```bash
# Edit manually or use:
sed -i "s/replace-with-your-gcp-project-id/YOUR_GCP_PROJECT_ID/g" Pulumi.dev.yaml
```

4. Deploy using the convenience script:

```bash
./deploy.sh
```

The Pulumi deployment will:
- Create a Google Artifact Registry repository
- Build and push the Docker image
- Create a Cloud SQL PostgreSQL instance
- Set up the database and user
- Deploy the application to Cloud Run
- Configure all necessary IAM permissions

To destroy all created resources:

```bash
./destroy.sh
```

### Database Configuration

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

## Environment Configuration

The application uses environment variables for configuration. Two files are provided for easy setup:

- `.env.example`: A template showing all required environment variables
- `.env`: Your local configuration file (created from the example)

### Environment Variables

The following environment variables can be configured:

#### Node.js Runtime
- `NODE_ENV`: Set to `development` for local development or `production` for production deployment
- `PORT`: The port the application will run on locally (default: 5000)

#### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string (comprehensive connection URL)
- `PGUSER`: PostgreSQL username
- `PGHOST`: PostgreSQL host
- `PGPASSWORD`: PostgreSQL password
- `PGDATABASE`: PostgreSQL database name
- `PGPORT`: PostgreSQL port (default: 5432)

#### Docker Configuration
- `DOCKER_DB_HOST`: The hostname for the database in Docker Compose (should be `db`)

#### Google Cloud Configuration (for Pulumi)
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_REGION`: GCP region for deployment (default: us-central1)
- `GCP_IMAGE_TAG`: Docker image tag for deployment (default: latest)

#### Pulumi Specific Configuration
- `PULUMI_PROJECT_NAME`: Name of the Pulumi project (default: todo-app)
- `PULUMI_DB_INSTANCE_NAME`: Name of the database instance (default: todo-db-instance)
- `PULUMI_DB_NAME`: Name of the database (default: todoapp)
- `PULUMI_DB_USERNAME`: Database username (default: todouser)
- `PULUMI_DB_PASSWORD`: Database password (should be changed for production)

### Setting Up Environment Variables

#### For Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your specific configuration:
   ```bash
   nano .env
   ```

3. The application will automatically load variables from the `.env` file when running locally.

#### For Docker Compose

Docker Compose will use the environment variables defined in the `docker-compose.yml` file. No additional setup is required.

#### For Cloud Deployment

1. Update the appropriate deployment configuration:
   - For cloud-deploy.sh: Edit the script directly
   - For cloudbuild.yaml: Edit the environment variables section
   - For Pulumi: Update values in Pulumi.dev.yaml

2. For sensitive values like passwords, use your cloud provider's secrets management system:
   - Google Secret Manager for GCP
   - Pulumi secrets for Pulumi deployments

## License

MIT
