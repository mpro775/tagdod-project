// Script لإنشاء السوبر أدمن مباشرة من خلال الـ database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema definitions
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  gender: String,
  jobTitle: String,
  passwordHash: String,
  isAdmin: { type: Boolean, default: false },
  roles: { type: [String], default: ['user'] },
  permissions: { type: [String], default: [] },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const CapabilitiesSchema = new mongoose.Schema({
  userId: String,
  customer_capable: Boolean,
  engineer_capable: Boolean,
  engineer_status: String,
  wholesale_capable: Boolean,
  wholesale_status: String,
  wholesale_discount_percent: Number,
  admin_capable: Boolean,
  admin_status: String
});

async function createSuperAdmin() {
  try {
    console.log('🚀 إنشاء السوبر أدمن مباشرة...');
    
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://bthwani1_db_user:WTmCFUDVVGOTeMHc@cluster0.vip178l.mongodb.net/tagadodo?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ متصل بقاعدة البيانات');

    const User = mongoose.model('User', UserSchema);
    const Capabilities = mongoose.model('Capabilities', CapabilitiesSchema);

    // التحقق من وجود سوبر أدمن
    const existingSuperAdmin = await User.findOne({
      roles: { $in: ['super_admin'] }
    });

    if (existingSuperAdmin) {
      console.log('⚠️ السوبر أدمن موجود بالفعل!');
      console.log('📱 رقم الهاتف:', existingSuperAdmin.phone);
      console.log('👤 الاسم:', existingSuperAdmin.firstName, existingSuperAdmin.lastName);
      console.log('🎭 الأدوار:', existingSuperAdmin.roles.join(', '));
      console.log('');
      console.log('🔐 بيانات تسجيل الدخول:');
      console.log('   رقم الهاتف: 777777777');
      console.log('   كلمة المرور: Admin123!@#');
      return;
    }

    // إنشاء السوبر أدمن
    const passwordHash = await bcrypt.hash('Admin123!@#', 10);
    
    const superAdmin = new User({
      phone: '777777777',
      firstName: 'Super',
      lastName: 'Admin',
      gender: 'male',
      jobTitle: 'System Administrator',
      passwordHash: passwordHash,
      isAdmin: true,
      roles: ['super_admin'],
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'analytics.read',
        'reports.read',
        'settings.read',
        'settings.update',
        'admin.access',
        'super_admin.access'
      ],
      status: 'active'
    });

    await superAdmin.save();
    console.log('✅ تم إنشاء السوبر أدمن بنجاح!');

    // إنشاء capabilities
    const adminCapabilities = new Capabilities({
      userId: superAdmin._id.toString(),
      customer_capable: true,
      engineer_capable: true,
      engineer_status: 'approved',
      wholesale_capable: true,
      wholesale_status: 'approved',
      wholesale_discount_percent: 0,
      admin_capable: true,
      admin_status: 'approved'
    });

    await adminCapabilities.save();
    console.log('✅ تم إنشاء الصلاحيات بنجاح!');

    console.log('');
    console.log('📱 رقم الهاتف:', superAdmin.phone);
    console.log('👤 الاسم:', superAdmin.firstName, superAdmin.lastName);
    console.log('🔑 كلمة المرور: Admin123!@#');
    console.log('🎭 الأدوار:', superAdmin.roles.join(', '));
    console.log('');
    console.log('🔐 بيانات تسجيل الدخول:');
    console.log('   رقم الهاتف: 777777777');
    console.log('   كلمة المرور: Admin123!@#');

  } catch (error) {
    console.log('❌ خطأ في إنشاء السوبر أدمن:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل الدالة
createSuperAdmin();
