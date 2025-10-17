#!/usr/bin/env node

/**
 * 🚀 Analytics Generation Script
 * Complete Analytics System for Solar Commerce
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Solar Commerce Analytics Generator');
console.log('📊 Complete Analytics System');
console.log('==================================');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the backend directory');
    process.exit(1);
}

// Check if .env file exists
if (!fs.existsSync('.env')) {
    console.error('❌ .env file not found. Please create it first.');
    process.exit(1);
}

// Check if the application is built
if (!fs.existsSync('dist')) {
    console.log('🔨 Building application...');
    try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Build successful!');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Generate analytics data
console.log('📊 Generating analytics data...');

try {
    // Generate daily analytics
    console.log('📅 Generating daily analytics...');
    execSync('node dist/scripts/generate-daily-analytics.js', { stdio: 'inherit' });
    
    // Generate weekly analytics
    console.log('📅 Generating weekly analytics...');
    execSync('node dist/scripts/generate-weekly-analytics.js', { stdio: 'inherit' });
    
    // Generate monthly analytics
    console.log('📅 Generating monthly analytics...');
    execSync('node dist/scripts/generate-monthly-analytics.js', { stdio: 'inherit' });
    
    console.log('✅ Analytics generation completed successfully!');
    
} catch (error) {
    console.error('❌ Analytics generation failed:', error.message);
    process.exit(1);
}

console.log('🎉 Analytics system is ready!');
console.log('📊 Dashboard: http://localhost:3000/api/analytics/dashboard');
console.log('📚 API Docs: http://localhost:3000/api/docs');
console.log('🔍 Health: http://localhost:3000/api/health');
