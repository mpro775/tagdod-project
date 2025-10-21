#!/usr/bin/env node

/**
 * Migration Runner - ترحيل Capabilities إلى User
 *
 * الاستخدام:
 * npm run migrate:capabilities
 */

import { migrateCapabilitiesToUser } from './migrate-capabilities-to-user';

async function main() {
  console.log('🚀 بدء عملية ترحيل البيانات...\n');

  try {
    await migrateCapabilitiesToUser();
    console.log('\n✅ تمت عملية الترحيل بنجاح!');
    console.log('💡 لتنظيف Capabilities collection، قم بتشغيل: npm run migrate:cleanup');
  } catch (error) {
    console.error('\n❌ فشلت عملية الترحيل:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
