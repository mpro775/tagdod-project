@echo off
echo ========================================
echo Fix NaN Stock Values Script
echo ========================================
echo.
echo This script will fix NaN values in the variants collection.
echo.
echo Press Ctrl+C to cancel, or
pause

cd /d "%~dp0\.."
call npx ts-node scripts/fix-nan-stock-values.ts

echo.
pause

