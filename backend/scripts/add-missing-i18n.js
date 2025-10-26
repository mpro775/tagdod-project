/**
 * إضافة ترجمات مفقودة لنظام i18n
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Schema للترجمات
const TranslationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  ar: { type: String, required: true },
  en: { type: String, required: true },
  namespace: { type: String, required: true },
  description: String,
  updatedBy: String,
  history: Array,
}, { timestamps: true });

const Translation = mongoose.model('Translation', TranslationSchema);

// ترجمات إضافية مفقودة
const additionalTranslations = [
  {
    key: 'navigation.i18nManagement',
    ar: 'نصوص التعريب',
    en: 'Translation Management',
    namespace: 'common',
    description: 'Translation management menu item'
  },
  {
    key: 'navigation.systemSettings',
    ar: 'إعدادات النظام',
    en: 'System Settings',
    namespace: 'common',
    description: 'System settings menu item'
  },
  {
    key: 'navigation.systemMonitoring',
    ar: 'مراقبة الأداء',
    en: 'System Monitoring',
    namespace: 'common',
    description: 'System monitoring menu item'
  },
  {
    key: 'navigation.errorLogs',
    ar: 'سجلات الأخطاء',
    en: 'Error Logs',
    namespace: 'common',
    description: 'Error logs menu item'
  },
];

async function addMissingTranslations() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/solar-commerce';
    console.log('🔄 جارٍ الاتصال بقاعدة البيانات...');
    await mongoose.connect(mongoUri);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    let added = 0;
    let existed = 0;

    for (const trans of additionalTranslations) {
      const existing = await Translation.findOne({ key: trans.key });
      
      if (existing) {
        console.log(`⏭️  موجود: ${trans.key}`);
        existed++;
      } else {
        await Translation.create({
          ...trans,
          updatedBy: 'system-import',
        });
        console.log(`✅ إضافة: ${trans.key}`);
        added++;
      }
    }

    console.log('\n📊 ملخص:');
    console.log(`✅ تمت الإضافة: ${added}`);
    console.log(`⏭️  كانت موجودة: ${existed}`);
    console.log(`📦 الإجمالي: ${added + existed}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ تم قطع الاتصال بقاعدة البيانات');
  }
}

addMissingTranslations().catch(console.error);

