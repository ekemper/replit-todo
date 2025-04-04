#!/bin/bash
echo "Destroying Todo App infrastructure in Google Cloud"
cd "$(dirname "$0")"
pulumi destroy
