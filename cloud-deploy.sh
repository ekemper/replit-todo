#!/bin/bash

# Exit on any error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set variables from environment or use defaults
PROJECT_ID=${GCP_PROJECT_ID:-"your-google-cloud-project-id"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME=${GCP_SERVICE_NAME:-"todo-app"}
DB_INSTANCE=${GCP_DB_INSTANCE:-"todo-app-postgres"}
DB_NAME=${GCP_DB_NAME:-"todoapp"}
DB_USER=${GCP_DB_USER:-"todouser"}
DB_PASSWORD=${GCP_DB_PASSWORD:-"changeme"}

# Prompt for variables if not set
if [ "$PROJECT_ID" = "your-google-cloud-project-id" ]; then
  read -p "Enter your Google Cloud Project ID: " PROJECT_ID
fi

echo "===== Todo Application Deployment to Google Cloud ====="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Database Instance: $DB_INSTANCE"

# Set the current project
echo -e "\n===== Setting Google Cloud Project ====="
gcloud config set project $PROJECT_ID

# Enable required services
echo -e "\n===== Enabling Required Services ====="
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo -e "\n===== Setting Up Artifact Registry ====="
REPO_NAME="todo-app-repo"
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
  echo "Creating Artifact Registry repository: $REPO_NAME"
  gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Todo application"
else
  echo "Artifact Registry repository $REPO_NAME already exists."
fi

# Configure Docker to use Artifact Registry
echo -e "\n===== Configuring Docker Authentication ====="
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build the Docker image
echo -e "\n===== Building Docker Image ====="
IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"
docker build -t $IMAGE_URL .

# Push the image to Artifact Registry
echo -e "\n===== Pushing Image to Artifact Registry ====="
docker push $IMAGE_URL

# Check if Cloud SQL instance exists, create if not
echo -e "\n===== Setting Up Cloud SQL Database ====="
if ! gcloud sql instances describe $DB_INSTANCE &>/dev/null; then
  echo "Creating Cloud SQL instance: $DB_INSTANCE"
  gcloud sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$DB_PASSWORD
  
  # Create database
  echo "Creating database: $DB_NAME"
  gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
  
  # Create user
  echo "Creating database user: $DB_USER"
  gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE \
    --password=$DB_PASSWORD
else
  echo "Cloud SQL instance $DB_INSTANCE already exists."
fi

# Get the database connection information
echo -e "\n===== Getting Database Connection Information ====="
DB_IP=$(gcloud sql instances describe $DB_INSTANCE --format='value(ipAddresses[0].ipAddress)')
echo "Database IP: $DB_IP"

# Build the database URL
DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_IP}:5432/${DB_NAME}"

# Deploy to Cloud Run
echo -e "\n===== Deploying to Cloud Run ====="
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URL \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=${DATABASE_URL},PGHOST=${DB_IP},PGUSER=${DB_USER},PGPASSWORD=${DB_PASSWORD},PGDATABASE=${DB_NAME},PGPORT=5432" \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo -e "\n===== Deployment Complete! ====="
echo "Your Todo application is now deployed at: $SERVICE_URL"
echo "Database connection has been configured."
echo ""
echo "To view logs: gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}\" --limit=20"
echo "To clean up resources, run: ./cloud-cleanup.sh"
