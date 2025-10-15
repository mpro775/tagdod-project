const axios = require('axios');

async function testDevLogin() {
  try {
    console.log('🔐 اختبار تسجيل دخول التطوير...');
    
    const response = await axios.post('http://localhost:3000/auth/dev-login', {
      phone: '777777777',
      password: 'Admin123!@#'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevLogin-Tester/1.0'
      },
      timeout: 10000
    });

    if (response.data.tokens) {
      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('🎫 Access Token:', response.data.tokens.access.substring(0, 50) + '...');
      console.log('🔄 Refresh Token:', response.data.tokens.refresh.substring(0, 50) + '...');
      console.log('👤 المستخدم:', response.data.me.firstName, response.data.me.lastName);
      console.log('📱 رقم الهاتف:', response.data.me.phone);
      console.log('🎭 الأدوار:', response.data.me.roles?.join(', ') || 'لا توجد أدوار');
    } else {
      console.log('❌ فشل في تسجيل الدخول:', response.data);
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
testDevLogin();
