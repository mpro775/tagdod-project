#!/bin/bash

# E2E Test Runner Script
# This script sets up the environment and runs E2E tests

set -e

echo "🚀 Starting E2E Test Suite..."

# Check if required environment variables are set
if [ -z "$MONGO_URI" ]; then
    echo "⚠️  MONGO_URI not set, using default MongoDB connection"
    export MONGO_URI="mongodb://localhost:27017/solar-commerce-test"
fi

if [ -z "$REDIS_URL" ]; then
    echo "⚠️  REDIS_URL not set, using default Redis connection"
    export REDIS_URL="redis://localhost:6379"
fi

# Set test environment variables
export NODE_ENV="test"
export JWT_SECRET="test-jwt-secret"
export REFRESH_SECRET="test-refresh-secret"
export OTP_DEV_ECHO="true"

echo "📋 Environment Configuration:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - MONGO_URI: $MONGO_URI"
echo "  - REDIS_URL: $REDIS_URL"
echo "  - OTP_DEV_ECHO: $OTP_DEV_ECHO"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Run E2E tests
echo "🧪 Running E2E tests..."
npm run test:e2e

echo "✅ E2E Test Suite completed successfully!"
