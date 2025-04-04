#!/bin/bash
set -e

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Todo App Pulumi Deployment Script${NC}"
echo -e "${YELLOW}--------------------------------${NC}"

# Check if required CLI tools are installed
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}Error: Google Cloud SDK (gcloud) is not installed.${NC}"; exit 1; }
command -v pulumi >/dev/null 2>&1 || { echo -e "${RED}Error: Pulumi CLI is not installed.${NC}"; exit 1; }

# Get GCP project ID
echo -e "${YELLOW}Setting up Google Cloud project...${NC}"
read -p "Enter your Google Cloud project ID: " GCP_PROJECT_ID

# Update Pulumi config
echo -e "${YELLOW}Updating Pulumi configuration...${NC}"
sed -i "s/replace-with-your-gcp-project-id/$GCP_PROJECT_ID/g" Pulumi.dev.yaml

# Login to gcloud if needed
echo -e "${YELLOW}Checking Google Cloud authentication...${NC}"
gcloud config set project $GCP_PROJECT_ID

# Enable required Google Cloud APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
gcloud services enable artifactregistry.googleapis.com \
                     run.googleapis.com \
                     sql-component.googleapis.com \
                     sqladmin.googleapis.com \
                     compute.googleapis.com \
                     iam.googleapis.com

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Set up Pulumi stack
echo -e "${YELLOW}Setting up Pulumi stack...${NC}"
pulumi stack select dev --create

# Prompt for database password
echo -e "${YELLOW}Setting up database password...${NC}"
read -sp "Enter a secure password for the database (will not be displayed): " DB_PASSWORD
echo
pulumi config set --secret dbPassword "$DB_PASSWORD"

echo -e "${GREEN}Configuration complete!${NC}"
echo -e "${YELLOW}Starting Pulumi deployment...${NC}"
echo -e "${YELLOW}This may take 15-20 minutes, especially for the Cloud SQL instance creation.${NC}"

# Run Pulumi to create resources
pulumi up

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}You can access your application at the URL shown above.${NC}"
echo -e "${YELLOW}To clean up all resources, run: ${NC}pulumi destroy"