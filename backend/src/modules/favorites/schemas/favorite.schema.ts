import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({ timestamps: true })
export class Favorite {
  _id?: Types.ObjectId;

  // دعم المستخدمين المسجلين
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: string | null;

  // دعم الزوار (Guest users)
  @Prop({ type: String, index: true, sparse: true })
  deviceId?: string | null; // معرف الجهاز للزوار

  // المنتج/Variant
  @Prop({ type: Types.ObjectId, ref: 'Product', index: true })
  productId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Variant', index: true, sparse: true })
  variantId?: string | null;

  // معلومات إضافية
  @Prop({ default: '' })
  note?: string; // ملاحظة خاصة (مثل: "هدية لأحمد")

  @Prop({ type: [String], default: [] })
  tags?: string[]; // وسوم (مثل: ["هدايا", "أولوية عالية"])

  // الإحصائيات
  @Prop({ default: 0 })
  viewsCount!: number; // عدد مرات فتح المفضلة من القائمة

  @Prop({ type: Date })
  lastViewedAt?: Date; // آخر مرة تم عرضها

  // للمزامنة
  @Prop({ default: false })
  isSynced!: boolean; // هل تمت المزامنة من guest إلى user

  @Prop({ type: Date })
  syncedAt?: Date; // وقت المزامنة

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Performance indexes
// منع التكرار للمستخدمين المسجلين
FavoriteSchema.index(
  { userId: 1, productId: 1, variantId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { userId: { $exists: true, $ne: null } } }
);

// منع التكرار للزوار
FavoriteSchema.index(
  { deviceId: 1, productId: 1, variantId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { deviceId: { $exists: true, $ne: null } } }
);

FavoriteSchema.index({ userId: 1, createdAt: -1 });
FavoriteSchema.index({ deviceId: 1, createdAt: -1 });
FavoriteSchema.index({ productId: 1, deletedAt: 1 });
FavoriteSchema.index({ deletedAt: 1 });
FavoriteSchema.index({ isSynced: 1 });
