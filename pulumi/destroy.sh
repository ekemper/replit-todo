#!/bin/bash
set -e

echo "Destroying Todo App resources on Google Cloud Run using Pulumi"
cd "$(dirname "$0")"

# Load environment variables from parent directory's .env file if it exists
if [ -f "../.env" ]; then
  echo "Loading environment variables from ../.env"
  export $(grep -v '^#' ../.env | xargs)
fi

echo "Starting Pulumi destruction process..."
pulumi destroy --yes

echo "Destruction complete! All cloud resources have been removed."