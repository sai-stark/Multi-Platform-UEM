#!/bin/bash
#ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@172.29.3.52  --> Use This cmd, so that you dont have to use password everytime.
set -e

SERVER="ubuntu@172.29.3.52"
DEPLOY_DIR="~/ui_docker_uem"

echo "🔨 Building..."
npm install
npm run build

echo "📦 Copying dist to server..."
scp -r dist/ $SERVER:$DEPLOY_DIR/

echo "🚀 Restarting on server..."
ssh $SERVER "cd $DEPLOY_DIR && docker compose down && docker compose up -d --build"

echo "✅ Deployed!"
