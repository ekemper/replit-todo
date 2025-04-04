#!/bin/bash
echo "Deploying Todo App to Google Cloud Run using Pulumi"
cd "$(dirname "$0")"
pulumi up
