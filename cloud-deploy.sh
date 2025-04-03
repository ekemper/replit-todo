#!/bin/bash

# Set variables
PROJECT_ID="your-google-cloud-project-id"  # Replace with your project ID
IMAGE_NAME="todo-app"
REGION="us-central1"  # Set your desired region
DB_INSTANCE="todo-app-postgres"  # Cloud SQL instance name

echo "Deploying Todo application to Google Cloud Run..."

# Build the docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:latest .

# Push the image to Google Container Registry
echo "Pushing to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --update-env-vars DATABASE_URL="$DATABASE_URL" \
  --min-instances=0 \
  --max-instances=10 \
  --port 5000

echo "Deployment completed!"
echo "Your application should be available at the URL provided above."