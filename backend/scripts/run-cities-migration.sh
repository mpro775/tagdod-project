#!/bin/bash

# Migration Script: إضافة حقل المدينة
# يقوم بتحديث السجلات القديمة وإضافة حقل المدينة

echo "🚀 تشغيل Migration: إضافة حقل المدينة للخدمات"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# التحقق من وجود ملف .env
if [ ! -f .env ]; then
    echo "❌ خطأ: ملف .env غير موجود"
    echo "💡 قم بإنشاء ملف .env أو نسخه من env.example"
    exit 1
fi

# تحميل متغيرات البيئة
source .env

# التحقق من MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "❌ خطأ: MONGODB_URI غير محدد في ملف .env"
    exit 1
fi

echo "✅ تم تحميل متغيرات البيئة"
echo "📍 قاعدة البيانات: $MONGODB_URI"
echo ""

# تأكيد المستخدم
read -p "⚠️  هل أنت متأكد من تشغيل الـ Migration؟ (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "🚫 تم إلغاء العملية"
    exit 0
fi

echo ""
echo "🔄 جارٍ تشغيل الـ Migration..."
echo ""

# تشغيل الـ Migration
npx ts-node scripts/migrate-add-cities.ts

# التحقق من نجاح العملية
if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ تمت عملية الـ Migration بنجاح!"
    echo ""
    echo "📋 ما تم إنجازه:"
    echo "  ✓ إضافة حقل المدينة للمستخدمين"
    echo "  ✓ إضافة حقل المدينة لطلبات الخدمات"
    echo "  ✓ تعيين 'صنعاء' كقيمة افتراضية"
    echo "  ✓ إنشاء الفهارس المطلوبة"
    echo ""
    echo "🎯 الخطوات التالية:"
    echo "  1. اختبر إنشاء طلب خدمة جديد مع المدينة"
    echo "  2. تحقق من فلترة الطلبات للمهندسين"
    echo "  3. راجع البيانات في MongoDB Compass"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ فشلت عملية الـ Migration!"
    echo ""
    echo "💡 يرجى مراجعة الأخطاء أعلاه"
    echo ""
    exit 1
fi

