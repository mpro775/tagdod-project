import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
import {
  Product,
  ProductDocument,
} from '../src/modules/products/schemas/product.schema';

type LeanProduct = {
  _id: Types.ObjectId | string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  name?: string;
  slug?: string;
};

interface BackfillOptions {
  dryRun?: boolean;
  batchSize?: number;
}

function toObjectId(value: LeanProduct['_id']): Types.ObjectId | null {
  if (!value) {
    return null;
  }

  if (value instanceof Types.ObjectId) {
    return value;
  }

  if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }

  if (
    typeof (value as { toString?: () => string }).toString === 'function' &&
    Types.ObjectId.isValid((value as { toString: () => string }).toString())
  ) {
    return new Types.ObjectId((value as { toString: () => string }).toString());
  }

  return null;
}

function deriveTimestamp(id: LeanProduct['_id']): Date {
  const objectId = toObjectId(id);
  if (objectId) {
    return objectId.getTimestamp();
  }

  // Fallback to "now" if the ObjectId is malformed (should not happen in practice)
  return new Date();
}

async function backfillProductTimestamps(options: BackfillOptions = {}) {
  const { dryRun = false, batchSize = 500 } = options;
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const productModel = app.get<Model<ProductDocument>>(
      getModelToken(Product.name),
    );

    const baseQuery = {
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { updatedAt: { $exists: false } },
        { updatedAt: null },
      ],
    };

    const totalMissing = await productModel.countDocuments(baseQuery);
    if (totalMissing === 0) {
      console.log('✅ جميع المنتجات تحتوي على createdAt/updatedAt.');
      return;
    }

    console.log(
      `🔍 تم العثور على ${totalMissing} منتج بدون createdAt أو updatedAt.`,
    );
    if (dryRun) {
      console.log('🧪 الوضع: Dry-run. لن يتم تنفيذ أي تحديثات على قاعدة البيانات.');
    }

    let processed = 0;
    let modifiedCount = 0;

    while (processed < totalMissing) {
      const batch = await productModel
        .find(baseQuery)
        .select({ _id: 1, createdAt: 1, updatedAt: 1, name: 1, slug: 1 })
        .sort({ _id: 1 })
        .skip(processed)
        .limit(batchSize)
        .lean<LeanProduct[]>();

      if (batch.length === 0) {
        break;
      }

      const operations = batch
        .map((product) => {
          const fallbackDate = deriveTimestamp(product._id);

          const createdAt: Date =
            product.createdAt ?? product.updatedAt ?? fallbackDate;

          const updatedAt: Date =
            product.updatedAt ?? product.createdAt ?? fallbackDate;

          const set: Partial<Record<'createdAt' | 'updatedAt', Date>> = {};

          if (!product.createdAt) {
            set.createdAt = createdAt;
          }

          if (!product.updatedAt) {
            set.updatedAt = updatedAt;
          }

          if (Object.keys(set).length === 0) {
            return null;
          }

          return {
            updateOne: {
              filter: { _id: product._id },
              update: { $set: set },
            },
          };
        })
        .filter(Boolean) as Array<{
        updateOne: {
          filter: { _id: LeanProduct['_id'] };
          update: { $set: Partial<Record<'createdAt' | 'updatedAt', Date>> };
        };
      }>;

      if (operations.length > 0) {
        if (dryRun) {
          console.log(
            `🧪 Batch preview (${operations.length} updates):\n${operations
              .map((op) => JSON.stringify(op.updateOne))
              .join('\n')}`,
          );
        } else {
          const result = await productModel.bulkWrite(operations, {
            ordered: false,
          });
          modifiedCount += result.modifiedCount ?? 0;
          console.log(
            `✅ تم تحديث ${result.modifiedCount ?? 0} منتج في هذه الدفعة.`,
          );
        }
      }

      processed += batch.length;
      console.log(
        `📊 التقدم: ${processed} / ${totalMissing} ( ${
          Math.min((processed / totalMissing) * 100, 100).toFixed(2)
        }% )`,
      );
    }

    if (!dryRun) {
      console.log(`🎉 اكتملت العملية. تم تحديث ${modifiedCount} منتج.`);
    } else {
      console.log('🧪 Dry-run مكتمل. لم يتم إجراء أي تغييرات على قاعدة البيانات.');
    }
  } catch (error) {
    console.error('❌ حدث خطأ أثناء معالجة المنتجات:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchIndex = args.findIndex((arg) => arg.startsWith('--batch-size='));

  const batchSize =
    batchIndex !== -1
      ? Number(args[batchIndex].split('=')[1]) || undefined
      : undefined;

  await backfillProductTimestamps({ dryRun, batchSize });
}

if (require.main === module) {
  main();
}

export { backfillProductTimestamps };

