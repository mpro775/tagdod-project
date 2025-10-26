/**
 * سكريبت لاختبار i18n API
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testI18nAPI() {
  console.log('🧪 اختبار i18n API...\n');

  try {
    // 1. اختبار الحصول على ترجمات عربية
    console.log('1️⃣  اختبار: GET /api/v1/i18n/public/translations/ar?namespace=common');
    const arResponse = await axios.get(`${API_URL}/api/v1/i18n/public/translations/ar`, {
      params: { namespace: 'common' }
    });
    
    // استخراج البيانات من الـ envelope
    const arData = arResponse.data.data || arResponse.data;
    const arCount = Object.keys(arData).length;
    console.log(`   ✅ تم الحصول على ${arCount} ترجمة عربية`);
    console.log(`   مثال: "${arData['navigation.dashboard'] || 'N/A'}"\n`);

    // 2. اختبار الحصول على ترجمات إنجليزية
    console.log('2️⃣  اختبار: GET /api/v1/i18n/public/translations/en?namespace=common');
    const enResponse = await axios.get(`${API_URL}/api/v1/i18n/public/translations/en`, {
      params: { namespace: 'common' }
    });
    
    const enData = enResponse.data.data || enResponse.data;
    const enCount = Object.keys(enData).length;
    console.log(`   ✅ تم الحصول على ${enCount} ترجمة إنجليزية`);
    console.log(`   مثال: "${enData['navigation.dashboard'] || 'N/A'}"\n`);

    // 3. اختبار الحصول على ترجمات validation
    console.log('3️⃣  اختبار: GET /api/v1/i18n/public/translations/ar?namespace=validation');
    const validationResponse = await axios.get(`${API_URL}/api/v1/i18n/public/translations/ar`, {
      params: { namespace: 'validation' }
    });
    
    const validationData = validationResponse.data.data || validationResponse.data;
    const validationCount = Object.keys(validationData).length;
    console.log(`   ✅ تم الحصول على ${validationCount} ترجمة للتحقق`);
    console.log(`   مثال: "${validationData['validation.required'] || 'N/A'}"\n`);

    // 4. اختبار الحصول على جميع الترجمات
    console.log('4️⃣  اختبار: GET /api/v1/i18n/public/all');
    const allResponse = await axios.get(`${API_URL}/api/v1/i18n/public/all`);
    
    const allData = allResponse.data.data || allResponse.data;
    const namespaces = Object.keys(allData);
    console.log(`   ✅ تم الحصول على ${namespaces.length} مساحة`);
    console.log(`   المساحات: ${namespaces.join(', ')}\n`);

    // 5. عرض ملخص
    console.log('📊 ملخص الاختبار:');
    console.log(`   ✅ API يعمل بشكل صحيح`);
    console.log(`   ✅ الترجمات العربية: ${arCount}`);
    console.log(`   ✅ الترجمات الإنجليزية: ${enCount}`);
    console.log(`   ✅ مساحات الترجمة: ${namespaces.length}`);
    console.log('\n🎉 جميع الاختبارات نجحت!');

    return true;
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('   الحالة:', error.response.status);
      console.error('   البيانات:', error.response.data);
    }
    return false;
  }
}

// تشغيل الاختبار
testI18nAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ خطأ غير متوقع:', error);
    process.exit(1);
  });

