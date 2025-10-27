/**
 * سكريبت لاستيراد الترجمات من ملفات JSON إلى قاعدة البيانات
 * 
 * الاستخدام:
 * node scripts/import-i18n-translations.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// قراءة المتغيرات البيئية
require('dotenv').config();

// الترجمات العربية
const arTranslations = {
  "app.name": "لوحة تحكم تجدٌد",
  "app.slogan": "نظام إدارة متقدم",
  
  // القوائم
  "navigation.dashboard": "لوحة التحكم",
  "navigation.users": "المستخدمون",
  "navigation.usersList": "قائمة المستخدمين",
  "navigation.usersAnalytics": "تحليلات المستخدمين",
  "navigation.catalog": "الكتالوج",
  "navigation.products": "المنتجات",
  "navigation.productsList": "قائمة المنتجات",
  "navigation.productsAnalytics": "تحليلات المنتجات",
  "navigation.productsInventory": "إدارة المخزون",
  "navigation.categories": "الفئات",
  "navigation.attributes": "السمات",
  "navigation.brands": "العلامات التجارية",
  "navigation.sales": "المبيعات",
  "navigation.orders": "الطلبات",
  "navigation.ordersList": "قائمة الطلبات",
  "navigation.ordersAnalytics": "تحليلات الطلبات",
  "navigation.coupons": "الكوبونات",
  "navigation.couponsList": "قائمة الكوبونات",
  "navigation.couponsAnalytics": "تحليلات الكوبونات",
  "navigation.settings": "الإعدادات",
  "navigation.marketing": "التسويق",
  "navigation.marketingDashboard": "لوحة التسويق",
  "navigation.priceRules": "قواعد الأسعار",
  "navigation.banners": "البنرات",
  "navigation.bannersList": "قائمة البنرات",
  "navigation.bannersAnalytics": "تحليلات البنرات",
  "navigation.promotions": "العروض",
  "navigation.media": "مكتبة الوسائط",
  "navigation.mediaLibrary": "مكتبة الوسائط",
  "navigation.mediaAnalytics": "إحصائيات الوسائط",
  "navigation.support": "الدعم الفني",
  "navigation.supportTickets": "قائمة التذاكر",
  "navigation.supportStats": "إحصائيات الدعم",
  "navigation.supportCannedResponses": "الردود الجاهزة",
  "navigation.notifications": "الإشعارات",
  "navigation.notificationsList": "قائمة الإشعارات",
  "navigation.notificationsAnalytics": "إحصائيات الإشعارات",
  "navigation.notificationsTemplates": "قوالب الإشعارات",
  "navigation.services": "الخدمات",
  "navigation.servicesOverview": "نظرة عامة",
  "navigation.servicesRequests": "طلبات الخدمات",
  "navigation.servicesEngineers": "إدارة المهندسين",
  "navigation.servicesOffers": "إدارة العروض",
  "navigation.servicesAnalytics": "تحليلات الخدمات",
  "navigation.analytics": "الإحصائيات",
  "navigation.analyticsDashboard": "لوحة الإحصائيات",
  "navigation.analyticsMain": "نظام التحليلات الشامل",
  "navigation.analyticsAdvanced": "إحصائيات متقدمة",
  "navigation.analyticsExport": "تصدير البيانات",
  "navigation.analyticsReports": "إدارة التقارير",
  "navigation.audit": "السجلات والتدقيق",
  "navigation.auditLogs": "سجلات التدقيق",
  "navigation.auditMain": "نظام التدقيق الشامل",
  "navigation.auditAnalytics": "تحليلات التدقيق",
  "navigation.systemManagement": "إدارة النظام",
  "navigation.systemMonitoring": "مراقبة الأداء",
  "navigation.errorLogs": "سجلات الأخطاء",
  "navigation.i18nManagement": "نصوص التعريب",
  "navigation.systemSettings": "إعدادات النظام",
  
  // الإجراءات
  "actions.title": "الإجراءات",
  "actions.add": "إضافة",
  "actions.edit": "تعديل",
  "actions.delete": "حذف",
  "actions.save": "حفظ",
  "actions.cancel": "إلغاء",
  "actions.confirm": "تأكيد",
  "actions.search": "بحث",
  "actions.filter": "تصفية",
  "actions.export": "تصدير",
  "actions.import": "استيراد",
  "actions.refresh": "تحديث",
  "actions.close": "إغلاق",
  "actions.view": "عرض",
  "actions.submit": "إرسال",
  "actions.activate": "تفعيل",
  "actions.suspend": "تعليق",
  
  // الحالات
  "status.active": "نشط",
  "status.inactive": "غير نشط",
  "status.pending": "قيد الانتظار",
  "status.suspended": "معلق",
  "status.confirmed": "مؤكد",
  "status.processing": "قيد المعالجة",
  "status.shipped": "تم الشحن",
  "status.delivered": "تم التسليم",
  "status.cancelled": "ملغى",
  "status.refunded": "مسترد",
  
  // مشترك
  "common.loading": "جارٍ التحميل...",
  "common.noData": "لا توجد بيانات",
  "common.error": "حدث خطأ",
  "common.success": "تم بنجاح",
  "common.warning": "تحذير",
  "common.info": "معلومات",
  "common.yes": "نعم",
  "common.no": "لا",
  "common.all": "الكل",
  "common.none": "لا شيء",
  "common.other": "أخرى",
  "common.user": "المستخدم",
  "common.profile": "الملف الشخصي",
  "common.logout": "تسجيل الخروج",
  "common.refresh_profile": "تحديث البيانات",
  
  // التحقق
  "validation.required": "هذا الحقل مطلوب",
  "validation.email": "البريد الإلكتروني غير صحيح",
  "validation.phone": "رقم الهاتف غير صحيح",
  "validation.minLength": "الحد الأدنى {{min}} أحرف",
  "validation.maxLength": "الحد الأقصى {{max}} حرف",
  "validation.min": "الحد الأدنى {{min}}",
  "validation.max": "الحد الأقصى {{max}}",
  "validation.pattern": "التنسيق غير صحيح",
  
  // الرسائل
  "messages.confirmDelete": "هل أنت متأكد من الحذف؟",
  "messages.deleteSuccess": "تم الحذف بنجاح",
  "messages.saveSuccess": "تم الحفظ بنجاح",
  "messages.updateSuccess": "تم التحديث بنجاح",
  "messages.createSuccess": "تم الإنشاء بنجاح",
  "messages.error": "حدث خطأ، يرجى المحاولة مرة أخرى"
};

// الترجمات الإنجليزية
const enTranslations = {
  "app.name": "Tagadodo Admin",
  "app.slogan": "Advanced Management System",
  
  // Navigation
  "navigation.dashboard": "Dashboard",
  "navigation.users": "Users",
  "navigation.usersList": "Users List",
  "navigation.usersAnalytics": "Users Analytics",
  "navigation.catalog": "Catalog",
  "navigation.products": "Products",
  "navigation.productsList": "Products List",
  "navigation.productsAnalytics": "Products Analytics",
  "navigation.productsInventory": "Inventory Management",
  "navigation.categories": "Categories",
  "navigation.attributes": "Attributes",
  "navigation.brands": "Brands",
  "navigation.sales": "Sales",
  "navigation.orders": "Orders",
  "navigation.ordersList": "Orders List",
  "navigation.ordersAnalytics": "Orders Analytics",
  "navigation.coupons": "Coupons",
  "navigation.couponsList": "Coupons List",
  "navigation.couponsAnalytics": "Coupons Analytics",
  "navigation.settings": "Settings",
  "navigation.marketing": "Marketing",
  "navigation.marketingDashboard": "Marketing Dashboard",
  "navigation.priceRules": "Price Rules",
  "navigation.banners": "Banners",
  "navigation.bannersList": "Banners List",
  "navigation.bannersAnalytics": "Banners Analytics",
  "navigation.promotions": "Promotions",
  "navigation.media": "Media Library",
  "navigation.mediaLibrary": "Media Library",
  "navigation.mediaAnalytics": "Media Analytics",
  "navigation.support": "Support",
  "navigation.supportTickets": "Support Tickets",
  "navigation.supportStats": "Support Statistics",
  "navigation.supportCannedResponses": "Canned Responses",
  "navigation.notifications": "Notifications",
  "navigation.notificationsList": "Notifications List",
  "navigation.notificationsAnalytics": "Notifications Analytics",
  "navigation.notificationsTemplates": "Notification Templates",
  "navigation.services": "Services",
  "navigation.servicesOverview": "Overview",
  "navigation.servicesRequests": "Service Requests",
  "navigation.servicesEngineers": "Engineers Management",
  "navigation.servicesOffers": "Offers Management",
  "navigation.servicesAnalytics": "Services Analytics",
  "navigation.analytics": "Analytics",
  "navigation.analyticsDashboard": "Analytics Dashboard",
  "navigation.analyticsMain": "Comprehensive Analytics System",
  "navigation.analyticsAdvanced": "Advanced Analytics",
  "navigation.analyticsExport": "Data Export",
  "navigation.analyticsReports": "Reports Management",
  "navigation.audit": "Audit & Logs",
  "navigation.auditLogs": "Audit Logs",
  "navigation.auditMain": "Comprehensive Audit System",
  "navigation.auditAnalytics": "Audit Analytics",
  "navigation.systemManagement": "System Management",
  "navigation.systemMonitoring": "Performance Monitoring",
  "navigation.errorLogs": "Error Logs",
  "navigation.i18nManagement": "Localization Texts",
  "navigation.systemSettings": "System Settings",
  
  // Actions
  "actions.title": "Actions",
  "actions.add": "Add",
  "actions.edit": "Edit",
  "actions.delete": "Delete",
  "actions.save": "Save",
  "actions.cancel": "Cancel",
  "actions.confirm": "Confirm",
  "actions.search": "Search",
  "actions.filter": "Filter",
  "actions.export": "Export",
  "actions.import": "Import",
  "actions.refresh": "Refresh",
  "actions.close": "Close",
  "actions.view": "View",
  "actions.submit": "Submit",
  "actions.activate": "Activate",
  "actions.suspend": "Suspend",
  
  // Status
  "status.active": "Active",
  "status.inactive": "Inactive",
  "status.pending": "Pending",
  "status.suspended": "Suspended",
  "status.confirmed": "Confirmed",
  "status.processing": "Processing",
  "status.shipped": "Shipped",
  "status.delivered": "Delivered",
  "status.cancelled": "Cancelled",
  "status.refunded": "Refunded",
  
  // Common
  "common.loading": "Loading...",
  "common.noData": "No Data",
  "common.error": "Error",
  "common.success": "Success",
  "common.warning": "Warning",
  "common.info": "Info",
  "common.yes": "Yes",
  "common.no": "No",
  "common.all": "All",
  "common.none": "None",
  "common.other": "Other",
  "common.user": "User",
  "common.profile": "Profile",
  "common.logout": "Logout",
  "common.refresh_profile": "Refresh Profile",
  
  // Validation
  "validation.required": "This field is required",
  "validation.email": "Invalid email address",
  "validation.phone": "Invalid phone number",
  "validation.minLength": "Minimum {{min}} characters",
  "validation.maxLength": "Maximum {{max}} characters",
  "validation.min": "Minimum {{min}}",
  "validation.max": "Maximum {{max}}",
  "validation.pattern": "Invalid format",
  
  // Messages
  "messages.confirmDelete": "Are you sure you want to delete?",
  "messages.deleteSuccess": "Deleted successfully",
  "messages.saveSuccess": "Saved successfully",
  "messages.updateSuccess": "Updated successfully",
  "messages.createSuccess": "Created successfully",
  "messages.error": "An error occurred, please try again"
};

// تحديد المساحة (namespace) بناءً على المفتاح
function getNamespace(key) {
  if (key.startsWith('app.')) return 'common';
  if (key.startsWith('navigation.')) return 'common';
  if (key.startsWith('actions.')) return 'common';
  if (key.startsWith('status.')) return 'common';
  if (key.startsWith('common.')) return 'common';
  if (key.startsWith('validation.')) return 'validation';
  if (key.startsWith('messages.')) return 'common';
  if (key.startsWith('auth.')) return 'auth';
  if (key.startsWith('products.')) return 'products';
  if (key.startsWith('orders.')) return 'orders';
  if (key.startsWith('services.')) return 'services';
  if (key.startsWith('users.')) return 'users';
  if (key.startsWith('settings.')) return 'settings';
  if (key.startsWith('notifications.')) return 'notifications';
  return 'common';
}

// Schema للترجمات
const TranslationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  ar: { type: String, required: true },
  en: { type: String, required: true },
  namespace: { type: String, required: true },
  description: String,
  updatedBy: String,
  history: Array,
}, { timestamps: true });

const Translation = mongoose.model('Translation', TranslationSchema);

async function importTranslations() {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/solar-commerce';
    console.log('🔄 جارٍ الاتصال بقاعدة البيانات...');
    await mongoose.connect(mongoUri);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // دمج جميع المفاتيح
    const allKeys = new Set([...Object.keys(arTranslations), ...Object.keys(enTranslations)]);

    console.log(`📊 إجمالي الترجمات للاستيراد: ${allKeys.size}\n`);

    for (const key of allKeys) {
      const ar = arTranslations[key] || '';
      const en = enTranslations[key] || '';
      const namespace = getNamespace(key);

      try {
        const existing = await Translation.findOne({ key });

        if (existing) {
          // تحديث الموجود
          existing.ar = ar;
          existing.en = en;
          existing.namespace = namespace;
          existing.updatedBy = 'system-import';
          await existing.save();
          updated++;
          console.log(`🔄 تحديث: ${key}`);
        } else {
          // إنشاء جديد
          await Translation.create({
            key,
            ar,
            en,
            namespace,
            updatedBy: 'system-import',
          });
          imported++;
          console.log(`✅ استيراد: ${key}`);
        }
      } catch (error) {
        console.error(`❌ خطأ في ${key}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📊 ملخص الاستيراد:');
    console.log(`✅ تم الاستيراد: ${imported}`);
    console.log(`🔄 تم التحديث: ${updated}`);
    console.log(`❌ تم التخطي: ${skipped}`);
    console.log(`📦 الإجمالي: ${imported + updated + skipped}`);

    // إحصائيات حسب المساحة
    const stats = await Translation.aggregate([
      { $group: { _id: '$namespace', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 الترجمات حسب المساحة:');
    stats.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

  } catch (error) {
    console.error('❌ خطأ في الاستيراد:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
importTranslations().catch(console.error);

