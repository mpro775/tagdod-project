import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../src/app.module';
import { Product, ProductDocument } from '../src/modules/products/schemas/product.schema';

async function backfillProductWarrantyYears(dryRun: boolean = false) {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const productModel = app.get<Model<ProductDocument>>(getModelToken(Product.name));

    const filter = {
      $or: [
        { warrantyDurationYears: { $exists: false } },
        { warrantyDurationYears: null },
        { warrantyDurationYears: { $type: 'string' } },
        { warrantyDurationYears: { $lt: 0 } },
      ],
    };

    const total = await productModel.countDocuments(filter);

    if (total === 0) {
      console.log('✅ جميع المنتجات تحتوي warrantyDurationYears صالح.');
      return;
    }

    console.log(`🔍 تم العثور على ${total} منتج يحتاج ضبط warrantyDurationYears.`);

    if (dryRun) {
      console.log('🧪 وضع المعاينة: لن يتم تنفيذ أي تحديث.');
      return;
    }

    const result = await productModel.updateMany(filter, {
      $set: { warrantyDurationYears: 0 },
    });

    console.log(
      `🎉 اكتملت المعالجة. matched=${result.matchedCount ?? 0}, modified=${result.modifiedCount ?? 0}`,
    );
  } catch (error) {
    console.error('❌ فشل تحديث warrantyDurationYears:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  await backfillProductWarrantyYears(dryRun);
}

if (require.main === module) {
  main();
}

export { backfillProductWarrantyYears };
