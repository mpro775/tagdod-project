#!/bin/bash

# 🚀 Tagdod API Deployment Script for VPS
# This script deploys the API with Redis in Docker and MongoDB externally

set -e

echo "🚀 Starting Tagdod API Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please update the configuration before continuing.${NC}"
        echo -e "${YELLOW}⚠️  Important: Update MONGO_URI and REDIS_URL in .env file${NC}"
        read -p "Press Enter after updating .env file to continue..."
    else
        echo -e "${RED}❌ .env.example file not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Validate .env file has required variables
echo "🔍 Validating .env file..."
if ! grep -q "MONGO_URI=" .env || ! grep -q "REDIS_URL=" .env; then
    echo -e "${RED}❌ .env file is missing required variables (MONGO_URI or REDIS_URL)${NC}"
    exit 1
fi

# Check if REDIS_URL points to localhost (for Docker network)
if grep -q "REDIS_URL=redis://localhost" .env; then
    echo -e "${YELLOW}⚠️  REDIS_URL points to localhost. Updating to use Docker service name...${NC}"
    sed -i 's|REDIS_URL=redis://localhost|REDIS_URL=redis://redis:6379|g' .env
    echo -e "${GREEN}✅ Updated REDIS_URL to use Docker service name${NC}"
fi

# Set NODE_ENV to production if not set
if ! grep -q "NODE_ENV=production" .env; then
    echo "NODE_ENV=production" >> .env
    echo -e "${GREEN}✅ Set NODE_ENV=production${NC}"
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if API is running
if docker ps | grep -q tagdod-api; then
    echo -e "${GREEN}✅ API container is running${NC}"
else
    echo -e "${RED}❌ API container failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs api${NC}"
    exit 1
fi

# Check if Redis is running
if docker ps | grep -q tagdod-redis; then
    echo -e "${GREEN}✅ Redis container is running${NC}"
else
    echo -e "${RED}❌ Redis container failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs redis${NC}"
    exit 1
fi

# Show container status
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  - View API logs: docker-compose -f docker-compose.prod.yml logs -f api"
echo "  - View Redis logs: docker-compose -f docker-compose.prod.yml logs -f redis"
echo ""
echo "🌐 API should be accessible at: http://localhost:3000"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "🔍 Health Check: http://localhost:3000/health/live"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Configure Nginx reverse proxy (see DEPLOYMENT_VPS.md)"
echo "  2. Set up SSL certificate with Let's Encrypt"
echo "  3. Configure MongoDB connection (external)"
echo ""

