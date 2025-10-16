import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariantPriceDocument = HydratedDocument<VariantPrice>;

@Schema({ timestamps: true })
export class VariantPrice {
  @Prop({ type: Types.ObjectId, ref: 'Variant', index: true }) 
  variantId!: string;
  
  // السعر الأساسي بالدولار الأمريكي (مطلوب)
  @Prop({ required: true, min: 0 }) 
  basePriceUSD!: number;
  
  // السعر المقارن بالدولار (اختياري)
  @Prop() 
  compareAtUSD?: number;
  
  // السعر بالجملة بالدولار (اختياري)
  @Prop() 
  wholesalePriceUSD?: number;
  
  // الحد الأدنى للطلب بالدولار (اختياري)
  @Prop() 
  moq?: number;
  
  // ملاحظات إضافية
  @Prop() 
  notes?: string;
}

export const VariantPriceSchema = SchemaFactory.createForClass(VariantPrice);

// فهرسة للبحث السريع
VariantPriceSchema.index({ variantId: 1 }, { unique: true });
VariantPriceSchema.index({ basePriceUSD: 1 });
VariantPriceSchema.index({ createdAt: -1 });
