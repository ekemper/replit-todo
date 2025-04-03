# Google Cloud Run Deployment Guide

This document provides step-by-step instructions for deploying the Todo application to Google Cloud Run.

## Prerequisites

1. A Google Cloud Platform account with billing enabled
2. Google Cloud SDK installed on your local machine
3. Docker installed on your local machine
4. A PostgreSQL database instance (Cloud SQL or other service)

## Setup Steps

### 1. Initial Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. Configure your Google Cloud project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Enable required APIs:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

### 2. Database Setup

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

3. Get connection information:
   ```bash
   gcloud sql instances describe todo-app-postgres
   ```
   Note the `connectionName` and IP address for the next steps.

### 3. Deploy to Cloud Run

#### Option 1: Manual Deployment

1. Update the `cloud-deploy.sh` script with your project ID:
   ```bash
   # Edit PROJECT_ID in the script
   nano cloud-deploy.sh
   ```

2. Set the DATABASE_URL environment variable for your deployment script:
   ```bash
   export DATABASE_URL="postgres://todouser:YOUR_SECURE_PASSWORD@IP_ADDRESS/todoapp"
   ```

3. Make the script executable and run it:
   ```bash
   chmod +x cloud-deploy.sh
   ./cloud-deploy.sh
   ```

#### Option 2: Using Cloud Build

1. Submit a build using the cloudbuild.yaml configuration:
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

2. Update the deployed service with the database connection:
   ```bash
   gcloud run services update todo-app \
     --region=us-central1 \
     --update-env-vars DATABASE_URL=postgres://todouser:YOUR_SECURE_PASSWORD@IP_ADDRESS/todoapp
   ```

### 4. Connect Cloud Run to Cloud SQL (Optional)

If you want to use Cloud SQL's private IP or Cloud SQL connector:

1. Connect your Cloud Run service to Cloud SQL:
   ```bash
   gcloud run services update todo-app \
     --add-cloudsql-instances=YOUR_PROJECT_ID:us-central1:todo-app-postgres \
     --region=us-central1
   ```

2. Update the DATABASE_URL to use the Cloud SQL connector:
   ```bash
   gcloud run services update todo-app \
     --region=us-central1 \
     --update-env-vars DATABASE_URL=postgres://todouser:YOUR_SECURE_PASSWORD@/todoapp?host=/cloudsql/YOUR_PROJECT_ID:us-central1:todo-app-postgres
   ```

### 5. Verify Deployment

1. Get the URL of your deployed app:
   ```bash
   gcloud run services describe todo-app \
     --region=us-central1 \
     --format="value(status.url)"
   ```

2. Open the URL in your browser to test the application.

## Troubleshooting

### Database Connection Issues

Note: The application now runs on port 8080 instead of 5000.

1. Check if your Cloud SQL instance is accessible from Cloud Run:
   - Verify that the IP allowlist includes the necessary ranges
   - Consider using Cloud SQL Auth Proxy instead of direct connection

2. Verify environment variables:
   ```bash
   gcloud run services describe todo-app --region=us-central1
   ```

### Application Errors

1. Check the logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=todo-app" --limit=20
   ```

2. Monitor container startup:
   ```bash
   gcloud run services logs read todo-app --region=us-central1
   ```

## Maintenance

### Updating Your Application

1. Make your changes to the codebase
2. Run the deployment script or use Cloud Build to redeploy
3. Monitor the deployment in the Google Cloud Console

### Database Migrations

When making schema changes:

1. Update your `shared/schema.ts` file
2. Test locally to ensure migrations work properly
3. Deploy the updated application, which will run migrations on startup

## Cost Optimization

- Cloud Run only charges for the time your application is running
- Use the `--min-instances=0` flag to scale to zero when not in use
- Choose a smaller instance size for development and testing
- Monitor your usage in the Google Cloud Console billing section