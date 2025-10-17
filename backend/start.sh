#!/bin/bash

# 🚀 Solar Commerce Backend Startup Script
# Complete Analytics System

echo "🚀 Starting Solar Commerce Backend..."
echo "📊 Complete Analytics System"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: mongod"
    exit 1
fi

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis first."
    echo "   You can start it with: redis-server"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. Please update the configuration."
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Start the application
echo "🚀 Starting application..."
echo "📊 Analytics Dashboard: http://localhost:3000/api/analytics/dashboard"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "🔍 Health Check: http://localhost:3000/api/health"
echo "=================================="

# Start with appropriate command based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting in production mode..."
    npm run start:prod
else
    echo "🔧 Starting in development mode..."
    npm run start:dev
fi
