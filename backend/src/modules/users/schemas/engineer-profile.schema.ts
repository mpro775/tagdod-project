import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EngineerProfileDocument = HydratedDocument<EngineerProfile>;

/**
 * تقييم فردي للمهندس (يحتوي على النجوم والنص)
 */
@Schema({ _id: false })
export class EngineerRating {
  @Prop({ required: true, min: 1, max: 5 })
  score!: number; // النجوم من 1-5

  @Prop({ required: true })
  comment!: string; // النص/التعليق

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId!: Types.ObjectId; // العميل الذي قام بالتقييم

  @Prop()
  customerName?: string; // اسم العميل (للعرض السريع)

  @Prop({ type: Types.ObjectId, ref: 'ServiceRequest' })
  serviceRequestId?: Types.ObjectId; // طلب الخدمة المرتبط

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId; // الطلب المرتبط (إن وجد)

  @Prop({ type: Date, default: Date.now })
  ratedAt!: Date; // تاريخ التقييم
}

export const EngineerRatingSchema = SchemaFactory.createForClass(EngineerRating);

/**
 * Schema بروفايل المهندس
 * يحتوي على معلومات البروفايل والتقييمات المجمعة
 */
@Schema({ timestamps: true })
export class EngineerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId; // ربط بـ User

  // === معلومات البروفايل ===
  @Prop({ maxlength: 1000 })
  bio?: string; // النبذة عن المهندس

  @Prop()
  avatarUrl?: string; // رابط الأفاتار (من Bunny.net)

  @Prop()
  whatsappNumber?: string; // رقم الواتساب (مختلف عن رقم الهاتف الأساسي)

  @Prop()
  jobTitle?: string; // المسمى الوظيفي للمهندس

  @Prop()
  cvFileUrl?: string; // رابط ملف السيرة الذاتية للمهندس (URL من Bunny.net)

  // === Wallet & Commission System ===
  @Prop({ default: 0, min: 0 })
  walletBalance!: number; // الرصيد الحالي للمهندس

  @Prop({ type: [Object], default: [] })
  commissionTransactions!: Array<{
    transactionId: string;
    type: 'commission' | 'withdrawal' | 'refund';
    amount: number;
    orderId?: Types.ObjectId;
    couponCode?: string;
    description?: string;
    createdAt: Date;
  }>;

  // === التقييمات الفردية ===
  @Prop({ type: [EngineerRatingSchema], default: [] })
  ratings!: EngineerRating[]; // قائمة بجميع التقييمات (كل تقييم له نص ونجوم)

  // === التقييمات المجمعة (محسوبة تلقائياً) ===
  @Prop({ default: 0 })
  totalRatings!: number; // إجمالي عدد التقييمات

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating!: number; // متوسط التقييم (محسوب من ratings)

  @Prop({ type: [Number], default: [0, 0, 0, 0, 0] })
  ratingDistribution!: number[]; // توزيع التقييمات [5نجوم, 4نجوم, 3نجوم, 2نجوم, 1نجمة]

  // === إحصائيات إضافية ===
  @Prop({ default: 0 })
  totalCompletedServices!: number; // إجمالي الخدمات المكتملة

  @Prop({ default: 0 })
  totalEarnings!: number; // إجمالي الأرباح

  // === حقول قابلة للتطوير ===
  @Prop({ type: [String], default: [] })
  specialties?: string[]; // التخصصات (مثل: ["ميكانيك", "كهرباء", "سباكة"])

  @Prop({ min: 0, max: 50 })
  yearsOfExperience?: number; // سنوات الخبرة

  @Prop({ type: [String], default: [] })
  certifications?: string[]; // الشهادات

  // === Helper Methods ===

  /**
   * حساب التقييمات المجمعة من التقييمات الفردية
   */
  calculateRatings(): void {
    if (!this.ratings || this.ratings.length === 0) {
      this.totalRatings = 0;
      this.averageRating = 0;
      this.ratingDistribution = [0, 0, 0, 0, 0];
      return;
    }

    this.totalRatings = this.ratings.length;

    // حساب المتوسط
    const sum = this.ratings.reduce((acc, rating) => acc + rating.score, 0);
    this.averageRating = Math.round((sum / this.totalRatings) * 10) / 10; // تقريب لرقم عشري واحد

    // حساب التوزيع [5, 4, 3, 2, 1]
    this.ratingDistribution = [0, 0, 0, 0, 0];
    this.ratings.forEach((rating) => {
      if (rating.score >= 1 && rating.score <= 5) {
        this.ratingDistribution[5 - rating.score] += 1;
      }
    });
  }

  /**
   * إضافة تقييم جديد
   */
  addRating(rating: EngineerRating): void {
    this.ratings.push(rating);
    this.calculateRatings();
  }

  /**
   * الحصول على التقييمات المرتبة حسب التاريخ (الأحدث أولاً)
   */
  getRecentRatings(limit?: number): EngineerRating[] {
    const sorted = [...this.ratings].sort((a, b) => b.ratedAt.getTime() - a.ratedAt.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * الحصول على التقييمات المرتبة حسب النجوم (الأعلى أولاً)
   */
  getTopRatings(limit?: number): EngineerRating[] {
    const sorted = [...this.ratings].sort((a, b) => b.score - a.score);
    return limit ? sorted.slice(0, limit) : sorted;
  }
}

export const EngineerProfileSchema = SchemaFactory.createForClass(EngineerProfile);

// === Indexes ===
EngineerProfileSchema.index({ userId: 1 }, { unique: true });
EngineerProfileSchema.index({ averageRating: -1 }); // للبحث والترتيب حسب التقييم
EngineerProfileSchema.index({ totalRatings: -1 }); // للترتيب حسب عدد التقييمات
EngineerProfileSchema.index({ 'ratings.ratedAt': -1 }); // للبحث في التقييمات
EngineerProfileSchema.index({ walletBalance: 1 }); // Index for wallet balance queries
EngineerProfileSchema.index({ jobTitle: 1 }); // Index for job title queries

// === Instance Methods ===
// إضافة calculateRatings كـ instance method في الـ schema
EngineerProfileSchema.methods.calculateRatings = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.totalRatings = 0;
    this.averageRating = 0;
    this.ratingDistribution = [0, 0, 0, 0, 0];
    return;
  }

  this.totalRatings = this.ratings.length;

  // حساب المتوسط
  const sum = this.ratings.reduce((acc: number, rating: EngineerRating) => acc + rating.score, 0);
  this.averageRating = Math.round((sum / this.totalRatings) * 10) / 10; // تقريب لرقم عشري واحد

  // حساب التوزيع [5, 4, 3, 2, 1]
  this.ratingDistribution = [0, 0, 0, 0, 0];
  this.ratings.forEach((rating: EngineerRating) => {
    if (rating.score >= 1 && rating.score <= 5) {
      this.ratingDistribution[5 - rating.score] += 1;
    }
  });
};

// إضافة addRating كـ instance method في الـ schema
EngineerProfileSchema.methods.addRating = function (rating: EngineerRating) {
  if (!this.ratings) {
    this.ratings = [];
  }
  this.ratings.push(rating);
  this.calculateRatings();
};

// === Pre-save hook لحساب التقييمات تلقائياً ===
EngineerProfileSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
    this.calculateRatings();
  }
  next();
});
