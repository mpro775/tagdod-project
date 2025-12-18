#!/bin/bash

# ========================================
# TAGDOD COMPLETE DEPLOYMENT SCRIPT
# Deploys all services: API, Landing Page, Admin Dashboard, and Nginx Proxy
# ========================================

set -e

echo "🚀 Starting Complete Tagdod Deployment..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if .env file exists in backend
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found. Creating from .env.example...${NC}"
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ backend/.env file created. Please update the configuration before continuing.${NC}"
        echo -e "${YELLOW}⚠️  Important: Update MONGO_URI and other secrets in backend/.env file${NC}"
        read -p "Press Enter after updating backend/.env file to continue..."
    else
        echo -e "${RED}❌ backend/.env.example file not found. Please create backend/.env file manually.${NC}"
        exit 1
    fi
fi

# Validate backend .env file has required variables
echo "🔍 Validating backend/.env file..."
if ! grep -q "MONGO_URI=" backend/.env; then
    echo -e "${RED}❌ backend/.env file is missing required MONGO_URI variable${NC}"
    exit 1
fi

# Update REDIS_URL for Docker network
if grep -q "REDIS_URL=redis://" backend/.env && ! grep -q "REDIS_URL=redis://redis:6379" backend/.env; then
    echo -e "${YELLOW}⚠️  Updating REDIS_URL to use Docker service name...${NC}"
    sed -i 's|REDIS_URL=redis://.*|REDIS_URL=redis://redis:6379|g' backend/.env
    echo -e "${GREEN}✅ Updated REDIS_URL to use Docker service name${NC}"
fi

# Set NODE_ENV to production if not set
if ! grep -q "NODE_ENV=production" backend/.env; then
    echo "NODE_ENV=production" >> backend/.env
    echo -e "${GREEN}✅ Set NODE_ENV=production${NC}"
fi

# Create nginx ssl directory if it doesn't exist
mkdir -p nginx/ssl

# Build and start all services
echo "🔨 Building all Docker images..."
docker-compose build --no-cache

echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Function to check service health
check_service() {
    local service_name=$1
    local container_name=$2
    local health_url=$3

    if docker ps | grep -q "$container_name"; then
        echo -e "${GREEN}✅ $service_name container is running${NC}"

        # Try to check health endpoint if provided
        if [ -n "$health_url" ]; then
            if curl -f --max-time 10 "$health_url" &>/dev/null; then
                echo -e "${GREEN}✅ $service_name health check passed${NC}"
            else
                echo -e "${YELLOW}⚠️  $service_name health check failed (might still be starting)${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $service_name container failed to start. Check logs with: docker-compose logs $service_name${NC}"
        return 1
    fi
}

# Check all services
echo ""
echo "📊 Service Status Check:"
echo "========================"

check_service "Redis" "tagdod-redis" ""
check_service "API" "tagdod-api" "http://localhost:3000/health/live"
check_service "Admin Dashboard" "tagdod-admin" "http://localhost:8081/health"
check_service "Nginx Proxy" "tagdod-nginx-proxy" ""

# Show container status
echo ""
echo "📊 Complete Container Status:"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Complete deployment finished successfully!${NC}"
echo ""
echo "🌐 Service URLs (when using Nginx proxy):"
echo "  - Admin Dashboard: https://allawzi.net"
echo "  - API: https://api.allawzi.net"
echo ""
echo "🔧 Useful commands:"
echo "  - View all logs: docker-compose logs -f"
echo "  - Stop all services: docker-compose down"
echo "  - Restart all services: docker-compose restart"
echo "  - View specific service logs: docker-compose logs -f <service_name>"
echo "  - Rebuild and restart: docker-compose up -d --build"
echo ""
echo "📝 Next steps:"
echo "  1. Add SSL certificates to nginx/ssl/ directory"
echo "  2. Update DNS records to point to your server (allawzi.net, api.allawzi.net)"
echo "  3. Enable HTTPS in nginx configurations"
echo "  4. Test all endpoints thoroughly"
echo ""
echo -e "${YELLOW}⚠️  Remember to configure SSL certificates for production use!${NC}"