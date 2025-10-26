import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SearchLogDocument = HydratedDocument<SearchLog>;

/**
 * Schema لتتبع عمليات البحث والإحصائيات
 */
@Schema({ timestamps: true })
export class SearchLog {
  @Prop({ required: true, trim: true, index: true })
  query!: string; // نص البحث

  @Prop({ type: String, enum: ['ar', 'en'], default: 'ar' })
  language?: string; // اللغة المستخدمة

  @Prop({ type: String, enum: ['products', 'categories', 'brands', 'all'], default: 'all' })
  entityType?: string; // نوع الكيان المبحوث عنه

  @Prop({ default: 0 })
  resultsCount!: number; // عدد النتائج

  @Prop({ default: false, index: true })
  hasResults!: boolean; // هل كانت هناك نتائج

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId; // المستخدم (إن كان مسجل دخول)

  @Prop()
  userIp?: string; // IP المستخدم

  @Prop()
  userAgent?: string; // معلومات المتصفح

  @Prop({ type: Object })
  filters?: Record<string, unknown>; // الفلاتر المستخدمة

  @Prop()
  responseTime?: number; // وقت الاستجابة بالميلي ثانية

  @Prop({ default: 0 })
  clickedResultId?: string; // المنتج الذي تم النقر عليه (إذا كان)

  @Prop({ default: false })
  wasSuccessful!: boolean; // هل كان البحث ناجح (تم النقر على نتيجة)

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);

// Indexes للأداء
SearchLogSchema.index({ query: 1, createdAt: -1 });
SearchLogSchema.index({ hasResults: 1, createdAt: -1 });
SearchLogSchema.index({ createdAt: -1 });
SearchLogSchema.index({ userId: 1, createdAt: -1 });
SearchLogSchema.index({ query: 'text' }); // Text index للبحث

