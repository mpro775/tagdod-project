#!/usr/bin/env node

/**
 * 🔍 Analytics Health Check Script
 * Complete Analytics System Health Monitoring
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Solar Commerce Analytics Health Check');
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

// Health check functions
async function checkDatabase() {
    console.log('🗄️  Checking database connection...');
    try {
        execSync('node dist/scripts/check-database.js', { stdio: 'inherit' });
        console.log('✅ Database connection: OK');
        return true;
    } catch (error) {
        console.error('❌ Database connection: FAILED');
        return false;
    }
}

async function checkRedis() {
    console.log('🔴 Checking Redis connection...');
    try {
        execSync('node dist/scripts/check-redis.js', { stdio: 'inherit' });
        console.log('✅ Redis connection: OK');
        return true;
    } catch (error) {
        console.error('❌ Redis connection: FAILED');
        return false;
    }
}

async function checkAnalytics() {
    console.log('📊 Checking analytics system...');
    try {
        execSync('node dist/scripts/check-analytics.js', { stdio: 'inherit' });
        console.log('✅ Analytics system: OK');
        return true;
    } catch (error) {
        console.error('❌ Analytics system: FAILED');
        return false;
    }
}

async function checkStockAlerts() {
    console.log('📦 Checking stock alerts...');
    try {
        execSync('node dist/scripts/check-stock-alerts.js', { stdio: 'inherit' });
        console.log('✅ Stock alerts: OK');
        return true;
    } catch (error) {
        console.error('❌ Stock alerts: FAILED');
        return false;
    }
}

async function checkCronJobs() {
    console.log('⏰ Checking cron jobs...');
    try {
        execSync('node dist/scripts/check-cron-jobs.js', { stdio: 'inherit' });
        console.log('✅ Cron jobs: OK');
        return true;
    } catch (error) {
        console.error('❌ Cron jobs: FAILED');
        return false;
    }
}

// Run all health checks
async function runHealthChecks() {
    console.log('🔍 Running comprehensive health checks...');
    console.log('==================================');
    
    const checks = [
        { name: 'Database', fn: checkDatabase },
        { name: 'Redis', fn: checkRedis },
        { name: 'Analytics', fn: checkAnalytics },
        { name: 'Stock Alerts', fn: checkStockAlerts },
        { name: 'Cron Jobs', fn: checkCronJobs },
    ];
    
    const results = [];
    
    for (const check of checks) {
        try {
            const result = await check.fn();
            results.push({ name: check.name, status: result ? 'PASS' : 'FAIL' });
        } catch (error) {
            console.error(`❌ ${check.name} check failed:`, error.message);
            results.push({ name: check.name, status: 'FAIL' });
        }
    }
    
    // Summary
    console.log('==================================');
    console.log('📊 Health Check Summary:');
    console.log('==================================');
    
    results.forEach(result => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${status} ${result.name}: ${result.status}`);
    });
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log('==================================');
    console.log(`📈 Overall Health: ${percentage}% (${passed}/${total})`);
    
    if (percentage >= 80) {
        console.log('🎉 System is healthy!');
        process.exit(0);
    } else if (percentage >= 60) {
        console.log('⚠️  System has some issues but is functional.');
        process.exit(1);
    } else {
        console.log('❌ System has critical issues!');
        process.exit(1);
    }
}

// Run health checks
runHealthChecks().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});
