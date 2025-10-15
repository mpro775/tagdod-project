const axios = require('axios');

async function createSuperAdmin() {
  try {
    console.log('🚀 إنشاء السوبر أدمن...');
    
    const response = await axios.post('http://localhost:3000/auth/create-super-admin', {
      secretKey: 'TAGADODO_SUPER_ADMIN_2024'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SuperAdmin-Creator/1.0'
      },
      timeout: 10000
    });

    if (response.data.success) {
      console.log('✅ تم إنشاء السوبر أدمن بنجاح!');
      console.log('📱 رقم الهاتف:', response.data.admin.phone);
      console.log('👤 الاسم:', response.data.admin.firstName, response.data.admin.lastName);
      console.log('🔑 كلمة المرور:', response.data.loginInfo.password);
      console.log('🎭 الأدوار:', response.data.admin.roles.join(', '));
      console.log('');
      console.log('🔐 بيانات تسجيل الدخول:');
      console.log('   رقم الهاتف: 777777777');
      console.log('   كلمة المرور: Admin123!@#');
    } else {
      console.log('❌ فشل في إنشاء السوبر أدمن:', response.data.error?.message);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ خطأ من الخادم:', error.response.data.error?.message || error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ لا يمكن الاتصال بالخادم. تأكد من أن الـ backend يعمل على http://localhost:3000');
      console.log('💡 شغل الـ backend أولاً: npm run start:dev');
    } else {
      console.log('❌ خطأ غير متوقع:', error.message);
    }
  }
}

// تشغيل الدالة
createSuperAdmin();
