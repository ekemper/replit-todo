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
REPO_NAME="todo-app-repo"

# Prompt for variables if not set
if [ "$PROJECT_ID" = "your-google-cloud-project-id" ]; then
  read -p "Enter your Google Cloud Project ID: " PROJECT_ID
fi

echo "===== Todo Application Resource Cleanup ====="
echo "This script will delete the following resources:"
echo "- Cloud Run service: $SERVICE_NAME"
echo "- Cloud SQL instance: $DB_INSTANCE (this will delete all databases)"
echo "- Artifact Registry repository: $REPO_NAME"
echo ""
read -p "Are you sure you want to continue? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Cleanup canceled."
  exit 0
fi

# Set the current project
gcloud config set project $PROJECT_ID

# Delete Cloud Run service
echo -e "\n===== Deleting Cloud Run Service ====="
if gcloud run services describe $SERVICE_NAME --region=$REGION &>/dev/null; then
  gcloud run services delete $SERVICE_NAME --region=$REGION --quiet
  echo "Cloud Run service deleted: $SERVICE_NAME"
else
  echo "Cloud Run service not found: $SERVICE_NAME"
fi

# Delete Cloud SQL instance
echo -e "\n===== Deleting Cloud SQL Instance ====="
if gcloud sql instances describe $DB_INSTANCE &>/dev/null; then
  gcloud sql instances delete $DB_INSTANCE --quiet
  echo "Cloud SQL instance deleted: $DB_INSTANCE"
else
  echo "Cloud SQL instance not found: $DB_INSTANCE"
fi

# Delete Artifact Registry repository
echo -e "\n===== Deleting Artifact Registry Repository ====="
if gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
  gcloud artifacts repositories delete $REPO_NAME --location=$REGION --quiet
  echo "Artifact Registry repository deleted: $REPO_NAME"
else
  echo "Artifact Registry repository not found: $REPO_NAME"
fi

echo -e "\n===== Cleanup Complete! ====="
echo "All Google Cloud resources have been deleted."
