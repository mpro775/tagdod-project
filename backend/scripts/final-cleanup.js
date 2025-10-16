#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Final cleanup of old marketing modules...\n');

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
      
      // Add new MarketingModule import if not exists
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

// Function to create backup
function createBackup() {
  const backupDir = 'backup-old-modules';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  modulesToDelete.forEach(module => {
    if (fs.existsSync(module)) {
      const backupPath = path.join(backupDir, path.basename(module));
      try {
        fs.cpSync(module, backupPath, { recursive: true });
        console.log(`📦 Backed up: ${module} → ${backupPath}`);
      } catch (error) {
        console.error(`❌ Error backing up ${module}:`, error.message);
      }
    }
  });
}

// Main cleanup process
console.log('📋 Final Cleanup Plan:');
console.log('   1. Create backup of old modules');
console.log('   2. Delete old modules');
console.log('   3. Update app.module.ts');
console.log('   4. Verify MarketingModule is working');
console.log('');

// Confirm before proceeding
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  This will permanently delete the old modules. Continue? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🚀 Starting final cleanup...\n');
    
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    createBackup();
    
    // Step 2: Delete old modules
    console.log('\n🗑️  Step 2: Deleting old modules...');
    let deletedCount = 0;
    modulesToDelete.forEach(module => {
      if (deleteDirectory(module)) {
        deletedCount++;
      }
    });
    
    // Step 3: Update app.module.ts
    console.log('\n📝 Step 3: Updating app.module.ts...');
    updateAppModule();
    
    console.log(`\n✅ Final cleanup completed!`);
    console.log(`   - Backed up old modules to backup-old-modules/`);
    console.log(`   - Deleted ${deletedCount}/${modulesToDelete.length} modules`);
    console.log(`   - Updated app.module.ts`);
    console.log('\n🎉 Old modules have been removed and replaced with the unified MarketingModule!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the new MarketingModule endpoints');
    console.log('   2. Update frontend to use new API endpoints');
    console.log('   3. Run database migrations if needed');
    console.log('   4. Update documentation');
    console.log('   5. Remove backup folder after confirming everything works');
    
  } else {
    console.log('\n❌ Final cleanup cancelled.');
  }
  
  rl.close();
});
