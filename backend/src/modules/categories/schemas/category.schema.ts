import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  // هيكل الشجرة (Parent-Child)
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true }) 
  parentId!: string | null;
  
  @Prop({ required: true }) 
  name!: string; // الاسم بالعربية
  
  @Prop({ required: true }) 
  nameEn!: string; // الاسم بالإنجليزية
  
  @Prop({ required: true, unique: true }) 
  slug!: string;
  
  @Prop({ required: true, index: true }) 
  path!: string; // e.g. /electronics/phones
  
  @Prop({ default: 0 }) 
  depth!: number;
  
  // البيانات الوصفية (ثنائي اللغة)
  @Prop({ default: '' }) 
  description?: string; // الوصف بالعربية
  
  @Prop({ default: '' }) 
  descriptionEn?: string; // الوصف بالإنجليزية
  
  @Prop() 
  image?: string; // صورة رئيسية للفئة
  
  @Prop({ type: Types.ObjectId, ref: 'Media' }) 
  imageId?: string; // من مستودع الصور
  
  @Prop() 
  icon?: string; // أيقونة صغيرة (للقوائم)
  
  @Prop({ type: Types.ObjectId, ref: 'Media' }) 
  iconId?: string; // أيقونة من المستودع
  
  // SEO
  @Prop() 
  metaTitle?: string;
  
  @Prop() 
  metaDescription?: string;
  
  @Prop({ type: [String], default: [] }) 
  metaKeywords?: string[];
  
  // الترتيب والعرض
  @Prop({ default: 0 }) 
  order!: number; // ترتيب العرض (للفرز)
  
  @Prop({ default: true }) 
  isActive!: boolean;
  
  @Prop({ default: true }) 
  showInMenu!: boolean; // عرض في القائمة الرئيسية
  
  @Prop({ default: false }) 
  isFeatured!: boolean; // فئة مميزة
  
  // الإحصائيات
  @Prop({ default: 0 }) 
  productsCount!: number; // عدد المنتجات في الفئة
  
  @Prop({ default: 0 }) 
  childrenCount!: number; // عدد الفئات الفرعية
  
  // Soft Delete
  @Prop({ type: Date, default: null }) 
  deletedAt?: Date | null;
  
  @Prop({ type: Types.ObjectId, ref: 'User' }) 
  deletedBy?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Performance indexes
CategorySchema.index({ parentId: 1, order: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1, showInMenu: 1 });
CategorySchema.index({ isFeatured: 1 });
CategorySchema.index({ deletedAt: 1 });
CategorySchema.index({ parentId: 1, isActive: 1, order: 1 });
CategorySchema.index({ name: 'text', description: 'text' }); // Full-text search

