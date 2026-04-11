#!/bin/bash
set -e
cd "$(dirname "$0")"
git pull origin main
npm install --production
npm run build
docker compose build --no-cache
docker compose up -d
echo "Deployed at $(date)"
