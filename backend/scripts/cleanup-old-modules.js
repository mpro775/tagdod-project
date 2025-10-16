#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cleanup of old marketing modules...\n');

// Modules to delete
const modulesToDelete = [
  'src/modules/promotions',
  'src/modules/coupons', 
  'src/modules/banners',
  'src/modules/pricing'
];

// Function to safely delete directory
function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`❌ Deleting: ${dirPath}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${dirPath}`);
      return true;
    } else {
      console.log(`⚠️  Not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${dirPath}:`, error.message);
    return false;
  }
}

// Function to update app.module.ts
function updateAppModule() {
  const appModulePath = 'src/app.module.ts';
  
  try {
    if (fs.existsSync(appModulePath)) {
      let content = fs.readFileSync(appModulePath, 'utf8');
      
      // Remove old module imports
      const oldImports = [
        'PromotionsModule',
        'CouponsModule', 
        'BannersModule',
        'PricingModule'
      ];
      
      oldImports.forEach(moduleName => {
        const importRegex = new RegExp(`import.*${moduleName}.*from.*;\\n?`, 'g');
        content = content.replace(importRegex, '');
        
        const moduleRegex = new RegExp(`\\s*${moduleName},?\\n?`, 'g');
        content = content.replace(moduleRegex, '');
      });
      
      // Add new MarketingModule import
      if (!content.includes('MarketingModule')) {
        content = content.replace(
          /import { Module } from '@nestjs\/common';/,
          `import { Module } from '@nestjs/common';
import { MarketingModule } from './modules/marketing/marketing.module';`
        );
        
        // Add to imports array
        const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
        if (importsMatch) {
          const importsContent = importsMatch[1];
          if (!importsContent.includes('MarketingModule')) {
            content = content.replace(
              /imports:\s*\[/,
              'imports: [\n    MarketingModule,'
            );
          }
        }
      }
      
      fs.writeFileSync(appModulePath, content);
      console.log('✅ Updated app.module.ts');
    } else {
      console.log('⚠️  app.module.ts not found');
    }
  } catch (error) {
    console.error('❌ Error updating app.module.ts:', error.message);
  }
}

// Main cleanup process
console.log('📋 Cleanup Plan:');
modulesToDelete.forEach(module => {
  console.log(`   - ${module}`);
});
console.log('   - Update app.module.ts\n');

// Confirm before proceeding
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  This will permanently delete the old modules. Continue? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🚀 Starting cleanup...\n');
    
    let deletedCount = 0;
    modulesToDelete.forEach(module => {
      if (deleteDirectory(module)) {
        deletedCount++;
      }
    });
    
    console.log('\n📝 Updating app.module.ts...');
    updateAppModule();
    
    console.log(`\n✅ Cleanup completed!`);
    console.log(`   - Deleted ${deletedCount}/${modulesToDelete.length} modules`);
    console.log(`   - Updated app.module.ts`);
    console.log('\n🎉 Old modules have been removed and replaced with the unified MarketingModule!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the new MarketingModule endpoints');
    console.log('   2. Update frontend API calls to use new endpoints');
    console.log('   3. Run database migrations if needed');
    console.log('   4. Update documentation');
    
  } else {
    console.log('\n❌ Cleanup cancelled.');
  }
  
  rl.close();
});
