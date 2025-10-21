import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../src/modules/users/schemas/user.schema';

// جميع الصلاحيات المتاحة
const ALL_PERMISSIONS = [
  // Users
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'users.suspend',
  'users.activate',
  'users.restore',

  // Products
  'products.read',
  'products.create',
  'products.update',
  'products.delete',

  // Categories
  'categories.read',
  'categories.create',
  'categories.update',
  'categories.delete',

  // Attributes
  'attributes.read',
  'attributes.create',
  'attributes.update',
  'attributes.delete',

  // Brands
  'brands.read',
  'brands.create',
  'brands.update',
  'brands.delete',

  // Orders
  'orders.read',
  'orders.update',
  'orders.cancel',
  'orders.refund',

  // Carts
  'carts.read',
  'carts.send_reminders',
  'carts.convert_to_order',

  // Services
  'services.read',
  'services.update',

  // Support
  'support.read',
  'support.update',
  'support.assign',

  // Marketing
  'marketing.read',
  'marketing.create',
  'marketing.update',
  'marketing.delete',

  // Analytics
  'analytics.read',
  'reports.generate',
  'analytics.export',

  // Media
  'media.manage',

  // Notifications
  'notifications.read',
  'notifications.manage',

  // Exchange Rates
  'exchange_rates.read',
  'exchange_rates.update',

  // System
  'settings.read',
  'settings.update',
  'system.logs',
  'system.backup',
  'system.maintenance',

  // Capabilities
  'capabilities.read',
  'capabilities.update',
  'capabilities.approve',
  'capabilities.reject',

  // Upload
  'upload.manage',
  'upload.delete',

  // Favorites
  'favorites.read',
  'favorites.manage',

  // Admin Access
  'admin.access',
  'super_admin.access',
];

async function updateSuperAdminPermissions() {
  console.log('🔄 بدء تحديث صلاحيات السوبر أدمن...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  // البحث عن السوبر أدمن
  const superAdmin = await userModel.findOne({
    roles: { $in: [UserRole.SUPER_ADMIN] },
  });

  if (!superAdmin) {
    console.log('❌ لم يتم العثور على سوبر أدمن في النظام');
    await app.close();
    return;
  }

  console.log(`👤 تم العثور على السوبر أدمن: ${superAdmin.firstName} ${superAdmin.lastName} (${superAdmin.phone})`);

  // تحديث الصلاحيات
  const oldPermissions = superAdmin.permissions || [];
  superAdmin.permissions = ALL_PERMISSIONS;

  await superAdmin.save();

  console.log('✅ تم تحديث صلاحيات السوبر أدمن بنجاح!');
  console.log(`📊 عدد الصلاحيات الجديدة: ${ALL_PERMISSIONS.length}`);
  console.log(`📈 الصلاحيات المضافة: ${ALL_PERMISSIONS.length - oldPermissions.length}`);

  // عرض ملخص الصلاحيات
  console.log('\n🔑 جميع الصلاحيات الممنوحة:');
  const permissionsByCategory = {
    'المستخدمين': ALL_PERMISSIONS.filter(p => p.startsWith('users.')),
    'المنتجات': ALL_PERMISSIONS.filter(p => p.startsWith('products.') || p.startsWith('categories.') || p.startsWith('attributes.') || p.startsWith('brands.')),
    'الطلبات': ALL_PERMISSIONS.filter(p => p.startsWith('orders.') || p.startsWith('carts.')),
    'الخدمات': ALL_PERMISSIONS.filter(p => p.startsWith('services.') || p.startsWith('support.')),
    'التسويق': ALL_PERMISSIONS.filter(p => p.startsWith('marketing.') || p.startsWith('notifications.')),
    'التحليلات': ALL_PERMISSIONS.filter(p => p.startsWith('analytics.') || p.startsWith('reports.')),
    'النظام': ALL_PERMISSIONS.filter(p => p.startsWith('settings.') || p.startsWith('system.') || p.startsWith('exchange_rates.')),
    'الإدارة': ALL_PERMISSIONS.filter(p => p.includes('admin') || p.includes('capabilities') || p.includes('upload') || p.includes('media') || p.includes('favorites')),
  };

  Object.entries(permissionsByCategory).forEach(([category, perms]) => {
    if (perms.length > 0) {
      console.log(`\n📂 ${category} (${perms.length}):`);
      perms.forEach(perm => console.log(`   • ${perm}`));
    }
  });

  await app.close();
  console.log('\n🎉 تم إكمال التحديث بنجاح!');
}

if (require.main === module) {
  updateSuperAdminPermissions().catch(console.error);
}

export { updateSuperAdminPermissions };
