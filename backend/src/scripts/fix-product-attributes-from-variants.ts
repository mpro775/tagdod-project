/**
 * سكريبت إصلاح المنتجات التي لديها variants بسمات لكن product.attributes فارغ
 * ================================================================================
 *
 * يبحث عن منتجات ذات attributes فارغة أو غير موجودة، لكن لديها variants تحتوي
 * على attributeValues، ثم يحدّث product.attributes من السمات المستخدمة في variants.
 *
 * الاستخدام:
 * npx ts-node src/scripts/fix-product-attributes-from-variants.ts
 *
 * أو:
 * npm run fix:product-attributes
 *
 * خيارات:
 * --dry-run  عرض المنتجات المتأثرة دون تنفيذ التحديث
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tagdod';
const DRY_RUN = process.argv.includes('--dry-run');

interface VariantAttributeValue {
  attributeId: mongoose.Types.ObjectId;
  valueId: mongoose.Types.ObjectId;
}

interface VariantDoc {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  attributeValues?: VariantAttributeValue[];
}

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name?: string;
  nameEn?: string;
  attributes?: mongoose.Types.ObjectId[];
}

interface FixResult {
  productId: string;
  productName: string;
  oldAttributes: string[];
  newAttributes: string[];
  variantsCount: number;
}

function extractAttributeIds(variants: VariantDoc[]): string[] {
  const ids = new Set<string>();
  for (const v of variants) {
    const avs = v.attributeValues ?? [];
    for (const av of avs) {
      if (av?.attributeId) {
        ids.add(String(av.attributeId));
      }
    }
  }
  return Array.from(ids).sort();
}

async function fixProductAttributes() {
  console.log('🔧 إصلاح product.attributes من variants...\n');
  if (DRY_RUN) {
    console.log('⚠️  وضع dry-run: لن يتم تنفيذ أي تحديثات\n');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('لم يتم الاتصال بقاعدة البيانات');
    }

    const productsCollection = db.collection<ProductDoc>('products');
    const variantsCollection = db.collection<VariantDoc>('variants');

    // 1. جلب المنتجات التي attributes فارغة أو غير موجودة
    const filter: Record<string, unknown> = {
      deletedAt: null,
      $or: [
        { attributes: { $exists: false } },
        { attributes: null },
        { attributes: [] },
        { attributes: { $size: 0 } },
      ],
    };
    const brokenProducts = await productsCollection.find(filter).toArray();

    console.log(`📋 تم العثور على ${brokenProducts.length} منتج بدون سمات (attributes)\n`);

    if (brokenProducts.length === 0) {
      console.log('✨ لا توجد منتجات تحتاج إصلاح!');
      return;
    }

    const fixResults: FixResult[] = [];
    let fixedCount = 0;

    for (const product of brokenProducts) {
      const productId = product._id.toString();

      // 2. جلب variants المنتج
      const variants = await variantsCollection
        .find({
          productId: product._id,
          deletedAt: null,
        })
        .toArray();

      if (variants.length === 0) continue;

      const attributeIds = extractAttributeIds(variants);
      if (attributeIds.length === 0) continue;

      const oldAttrs = (product.attributes ?? []).map(String);
      const newAttrs = attributeIds;

      fixResults.push({
        productId,
        productName: product.nameEn ?? product.name ?? productId,
        oldAttributes: oldAttrs,
        newAttributes: newAttrs,
        variantsCount: variants.length,
      });

      if (!DRY_RUN) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { attributes: attributeIds.map((id) => new mongoose.Types.ObjectId(id)) } },
        );
        fixedCount++;
        console.log(`✅ ${product.nameEn ?? productId}: تم إضافة ${newAttrs.length} سمات`);
      }
    }

    // 3. التقرير النهائي
    console.log('\n' + '='.repeat(70));
    console.log('📊 التقرير النهائي');
    console.log('='.repeat(70) + '\n');

    if (fixResults.length === 0) {
      console.log('✨ لا توجد منتجات لديها variants بسمات و attributes فارغة.');
      console.log('   (المنتجات قد تكون بدون variants أو variants بدون attributeValues)');
      return;
    }

    console.log(`إجمالي المنتجات المُصلحة: ${fixResults.length}\n`);
    if (!DRY_RUN) {
      console.log(`تم تحديث ${fixedCount} منتج في قاعدة البيانات.\n`);
    }

    console.log('تفاصيل المنتجات المتأثرة:');
    console.log('-'.repeat(70));
    console.log('| المنتج | عدد الـ variants | السمات المُضافة |');
    console.log('-'.repeat(70));

    for (const r of fixResults) {
      const nameShort = r.productName.length > 35 ? r.productName.slice(0, 32) + '...' : r.productName;
      console.log(`| ${nameShort.padEnd(35)} | ${String(r.variantsCount).padStart(16)} | ${r.newAttributes.join(', ')} |`);
    }
    console.log('-'.repeat(70));

    if (DRY_RUN && fixResults.length > 0) {
      console.log('\n💡 شغّل بدون --dry-run لتنفيذ التحديثات.');
    }

    console.log('\n✅ تم الانتهاء بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

fixProductAttributes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
