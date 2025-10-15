#!/bin/bash

echo "========================================"
echo "   إنشاء الادمن الرئيسي - Tagadodo"
echo "========================================"
echo

echo "🚀 بدء إنشاء الادمن الرئيسي..."
echo

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ خطأ: Node.js غير مثبت"
    echo "يرجى تثبيت Node.js من https://nodejs.org"
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ خطأ: npm غير متوفر"
    exit 1
fi

echo "✅ تم التحقق من Node.js و npm"
echo

# تشغيل السكريبت
echo "📝 تشغيل سكريبت إنشاء الادمن..."
echo

node scripts/run-create-admin.js

echo
echo "========================================"
echo "تم الانتهاء من تشغيل السكريبت"
echo "========================================"
echo
echo "إذا واجهت أي مشاكل، راجع ملف README.md في مجلد scripts"
echo
