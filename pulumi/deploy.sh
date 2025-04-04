#!/bin/bash
set -e

echo "Deploying Todo App to Google Cloud Run using Pulumi"
cd "$(dirname "$0")"

# Load environment variables from parent directory's .env file if it exists
if [ -f "../.env" ]; then
  echo "Loading environment variables from ../.env"
  export $(grep -v '^#' ../.env | xargs)
fi

# Set Pulumi config values from environment variables
echo "Setting Pulumi configuration from environment variables..."

# Project configuration
if [ -n "$GCP_PROJECT_ID" ]; then
  pulumi config set gcpProject "$GCP_PROJECT_ID"
  echo "Set GCP project ID to $GCP_PROJECT_ID"
else
  echo "Warning: GCP_PROJECT_ID not set in .env file"
  read -p "Enter your GCP project ID: " GCP_PROJECT_ID
  pulumi config set gcpProject "$GCP_PROJECT_ID"
fi

# Set region if provided
if [ -n "$GCP_REGION" ]; then
  pulumi config set gcpRegion "$GCP_REGION"
  echo "Set GCP region to $GCP_REGION"
fi

# Set image tag if provided
if [ -n "$GCP_IMAGE_TAG" ]; then
  pulumi config set imageTag "$GCP_IMAGE_TAG"
  echo "Set image tag to $GCP_IMAGE_TAG"
fi

# Database configuration
if [ -n "$PULUMI_PROJECT_NAME" ]; then
  pulumi config set projectName "$PULUMI_PROJECT_NAME"
  echo "Set project name to $PULUMI_PROJECT_NAME"
fi

if [ -n "$PULUMI_DB_INSTANCE_NAME" ]; then
  pulumi config set dbInstanceName "$PULUMI_DB_INSTANCE_NAME"
  echo "Set DB instance name to $PULUMI_DB_INSTANCE_NAME"
fi

if [ -n "$PULUMI_DB_NAME" ]; then
  pulumi config set dbName "$PULUMI_DB_NAME"
  echo "Set DB name to $PULUMI_DB_NAME"
fi

if [ -n "$PULUMI_DB_USERNAME" ]; then
  pulumi config set dbUsername "$PULUMI_DB_USERNAME"
  echo "Set DB username to $PULUMI_DB_USERNAME"
fi

if [ -n "$PULUMI_DB_PASSWORD" ]; then
  pulumi config set --secret dbPassword "$PULUMI_DB_PASSWORD"
  echo "Set DB password (secret)"
fi

echo "Starting Pulumi deployment..."
pulumi up

echo "Deployment complete! Check the outputs above for your service URL."
