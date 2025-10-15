@echo off
echo ========================================
echo    إنشاء الادمن الرئيسي - Tagadodo
echo ========================================
echo.

echo 🚀 بدء إنشاء الادمن الرئيسي...
echo.

REM التحقق من وجود Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: Node.js غير مثبت
    echo يرجى تثبيت Node.js من https://nodejs.org
    pause
    exit /b 1
)

REM التحقق من وجود npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: npm غير متوفر
    pause
    exit /b 1
)

echo ✅ تم التحقق من Node.js و npm
echo.

REM تشغيل السكريبت
echo 📝 تشغيل سكريبت إنشاء الادمن...
echo.

node scripts/run-create-admin.js

echo.
echo ========================================
echo تم الانتهاء من تشغيل السكريبت
echo ========================================
echo.
echo إذا واجهت أي مشاكل، راجع ملف README.md في مجلد scripts
echo.
pause
