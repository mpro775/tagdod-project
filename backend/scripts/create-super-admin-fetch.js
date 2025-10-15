async function createSuperAdmin() {
  try {
    console.log('🚀 إنشاء السوبر أدمن...');
    
    const response = await fetch('http://localhost:3000/auth/create-super-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secretKey: 'TAGADODO_SUPER_ADMIN_2024'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ تم إنشاء السوبر أدمن بنجاح!');
      console.log('📱 رقم الهاتف:', data.admin.phone);
      console.log('👤 الاسم:', data.admin.firstName, data.admin.lastName);
      console.log('🔑 كلمة المرور:', data.loginInfo.password);
      console.log('🎭 الأدوار:', data.admin.roles.join(', '));
      console.log('');
      console.log('🔐 بيانات تسجيل الدخول:');
      console.log('   رقم الهاتف: 777777777');
      console.log('   كلمة المرور: Admin123!@#');
    } else {
      console.log('❌ فشل في إنشاء السوبر أدمن:', data.error?.message);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ لا يمكن الاتصال بالخادم. تأكد من أن الـ backend يعمل على http://localhost:3000');
      console.log('💡 شغل الـ backend أولاً: npm run start:dev');
    } else {
      console.log('❌ خطأ غير متوقع:', error.message);
    }
  }
}

// تشغيل الدالة
createSuperAdmin();
