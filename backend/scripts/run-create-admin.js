#!/usr/bin/env node

/**
 * سكريبت إنشاء الادمن الرئيسي
 * 
 * الاستخدام:
 * node scripts/run-create-admin.js
 * node scripts/run-create-admin.js --update-password
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 بدء إنشاء الادمن الرئيسي...\n');

// تشغيل السكريبت
const scriptPath = path.join(__dirname, 'create-super-admin.ts');
const args = process.argv.slice(2);

const child = spawn('npx', ['ts-node', scriptPath, ...args], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ تم تنفيذ السكريبت بنجاح!');
  } else {
    console.log(`\n❌ فشل في تنفيذ السكريبت (كود الخروج: ${code})`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
});
