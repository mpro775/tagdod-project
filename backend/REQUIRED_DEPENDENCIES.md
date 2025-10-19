# المكتبات المطلوبة لإنشاء التقارير

## المكتبات المطلوبة

### 1. Puppeteer (لإنشاء PDF)
```bash
npm install puppeteer
npm install --save-dev @types/puppeteer
```

### 2. XLSX (لإنشاء ملفات Excel)
```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

### 3. مكتبات Node.js الأساسية
```bash
# هذه موجودة بالفعل في Node.js
# fs - نظام الملفات
# path - مسارات الملفات
```

## التكوين المطلوب

### 1. متغيرات البيئة
```env
# في ملف .env
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 2. مجلدات التخزين
```
uploads/
├── reports/
│   ├── orders-report-2024-01-15.pdf
│   ├── orders-report-2024-01-15.xlsx
│   └── ...
```

### 3. صلاحيات المجلدات
```bash
# إنشاء مجلد uploads مع الصلاحيات المناسبة
mkdir -p uploads/reports
chmod 755 uploads/reports
```

## الميزات المطبقة

### إنشاء PDF
- ✅ استخدام Puppeteer لتحويل HTML إلى PDF
- ✅ تنسيق A4 مع هوامش مناسبة
- ✅ دعم اللغة العربية مع RTL
- ✅ إحصائيات وتفاصيل الطلبات
- ✅ تصميم احترافي مع CSS

### إنشاء Excel
- ✅ استخدام مكتبة XLSX لإنشاء ملفات Excel
- ✅ تنسيق الأعمدة بعرض مناسب
- ✅ بيانات شاملة لكل طلب
- ✅ دعم اللغة العربية في البيانات
- ✅ تسمية ورقة العمل بالعربية

### إدارة الملفات
- ✅ إنشاء مجلد التقارير تلقائياً
- ✅ تسمية الملفات بالتاريخ
- ✅ حفظ الملفات في مجلد uploads/reports
- ✅ إرجاع مسارات نسبية للوصول من الويب

## الاستخدام

### API Endpoints
```
GET /admin/orders/reports/orders?format=pdf
GET /admin/orders/reports/orders?format=excel
```

### الاستجابة
```json
{
  "success": true,
  "message": "تم إنشاء تقرير PDF",
  "data": {
    "url": "/uploads/reports/orders-report-2024-01-15.pdf"
  }
}
```

## ملاحظات مهمة

### Puppeteer
- يتطلب Chrome/Chromium مثبت على الخادم
- في Docker، استخدم `--no-sandbox` و `--disable-setuid-sandbox`
- في الإنتاج، قد تحتاج لتثبيت Chrome يدوياً

### XLSX
- لا يتطلب مكتبات خارجية إضافية
- يدعم تنسيقات Excel المختلفة
- يعمل بشكل ممتاز مع البيانات العربية

### الأداء
- PDF generation قد يستغرق وقتاً أطول للطلبات الكبيرة
- Excel generation أسرع من PDF
- يُنصح بإضافة caching للتقارير المتكررة

---

**تاريخ التطبيق**: ${new Date().toLocaleDateString('ar-SA')}
**الحالة**: مكتمل 100% ✅
