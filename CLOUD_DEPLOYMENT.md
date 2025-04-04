# Google Cloud Deployment Guide

This document provides step-by-step instructions for deploying the Todo application to Google Cloud Platform using the gcloud command-line tool.

## Prerequisites

1. A Google Cloud Platform account with billing enabled
2. Google Cloud SDK (gcloud CLI) installed and configured on your local machine
3. Docker installed on your local machine

## Configuration Options

You can deploy the Todo application to Google Cloud in two ways:

1. **Interactive deployment script** - Using the provided `cloud-deploy.sh` script which will guide you through the process
2. **Automated CI/CD pipeline** - Using Cloud Build with the provided `cloudbuild.yaml` configuration

## Option 1: Interactive Deployment

The `cloud-deploy.sh` script provides a guided deployment experience that will:

1. Set up all required Google Cloud resources
2. Build and push the Docker image
3. Create a Cloud SQL PostgreSQL database
4. Deploy the application to Cloud Run
5. Configure all environment variables

### Step 1: Configure your environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to update the following values:
   ```
   GCP_PROJECT_ID=your-google-cloud-project-id
   GCP_REGION=us-central1
   GCP_SERVICE_NAME=todo-app
   GCP_DB_INSTANCE=todo-app-postgres
   GCP_DB_NAME=todoapp
   GCP_DB_USER=todouser
   GCP_DB_PASSWORD=your-secure-password
   ```

### Step 2: Run the deployment script

1. Make the script executable:
   ```bash
   chmod +x cloud-deploy.sh
   ```

2. Run the script:
   ```bash
   ./cloud-deploy.sh
   ```

3. Follow the prompts and wait for the deployment to complete.

4. When deployment is complete, the script will display the URL where your application is available.

## Option 2: Cloud Build Pipeline

For automated CI/CD deployments, you can use Google Cloud Build with the provided configuration.

### Step 1: Set up Cloud Build

1. Enable the required APIs:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

2. Create the Artifact Registry repository:
   ```bash
   gcloud artifacts repositories create todo-app-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Docker repository for Todo application"
   ```

3. Set up a Cloud SQL PostgreSQL instance:
   ```bash
   gcloud sql instances create todo-app-postgres \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1 \
     --root-password=YOUR_SECURE_PASSWORD

   gcloud sql databases create todoapp --instance=todo-app-postgres

   gcloud sql users create todouser \
     --instance=todo-app-postgres \
     --password=YOUR_SECURE_PASSWORD
   ```

4. Get the database IP address:
   ```bash
   gcloud sql instances describe todo-app-postgres \
     --format="value(ipAddresses[0].ipAddress)"
   ```

### Step 2: Update the Cloud Build configuration

Edit the `cloudbuild.yaml` file to add your database connection details:

```yaml
substitutions:
  _REGION: us-central1
  _SERVICE_NAME: todo-app
  _REPO_NAME: todo-app-repo
  _DB_HOST: YOUR_DB_HOST  # Replace with your database IP
  _DB_USER: todouser
  _DB_PASSWORD: YOUR_SECURE_PASSWORD
  _DB_NAME: todoapp
  _DATABASE_URL: postgres://todouser:YOUR_SECURE_PASSWORD@YOUR_DB_HOST:5432/todoapp
```

### Step 3: Trigger a build

You can trigger a build manually or connect your repository to Cloud Build for automatic deployments:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## Database Migration and Management

The application is configured to initialize the database schema on first run using Drizzle ORM. For production deployments:

1. Make sure the database user has the necessary permissions:
   ```bash
   gcloud sql users set-password todouser \
     --instance=todo-app-postgres \
     --password=YOUR_SECURE_PASSWORD
   ```

2. If you need to manually run migrations:
   ```bash
   # Configure connection
   export DATABASE_URL=postgres://todouser:YOUR_SECURE_PASSWORD@YOUR_DB_HOST:5432/todoapp
   
   # Run migration
   npm run db:push
   ```

## Environment Variables Reference

The following environment variables are used for deployment:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | - |
| `GCP_REGION` | Google Cloud region | us-central1 |
| `GCP_SERVICE_NAME` | Cloud Run service name | todo-app |
| `GCP_DB_INSTANCE` | Cloud SQL instance name | todo-app-postgres |
| `GCP_DB_NAME` | Database name | todoapp |
| `GCP_DB_USER` | Database username | todouser |
| `GCP_DB_PASSWORD` | Database password | - |

## Monitoring and Troubleshooting

### Viewing Logs

To view the application logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=todo-app" --limit=20
```

### Checking Service Status

To check the status of your Cloud Run service:

```bash
gcloud run services describe todo-app --region=us-central1
```

### Common Issues

#### Database Connection Errors

If you encounter database connection issues:

1. Verify that the Cloud SQL instance is accessible:
   ```bash
   gcloud sql instances describe todo-app-postgres
   ```

2. Check that the user has the correct permissions:
   ```bash
   gcloud sql users list --instance=todo-app-postgres
   ```

3. Verify that the environment variables are set correctly:
   ```bash
   gcloud run services describe todo-app --region=us-central1 --format="yaml(spec.template.spec.containers[0].env)"
   ```

#### Application Errors

If the application fails to start:

1. Check the Cloud Run service logs:
   ```bash
   gcloud run services logs read todo-app --region=us-central1
   ```

2. Verify that the container starts successfully:
   ```bash
   gcloud run services describe todo-app --region=us-central1 --format="yaml(status)"
   ```

## Cleanup

To delete all created resources, use the provided cleanup script:

```bash
chmod +x cloud-cleanup.sh
./cloud-cleanup.sh
```

The script will interactively confirm before deleting:
- The Cloud Run service
- The Cloud SQL instance
- The Artifact Registry repository

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL Documentation](https://cloud.google.com/sql/docs/postgres)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [gcloud Command-Line Reference](https://cloud.google.com/sdk/gcloud/reference)
