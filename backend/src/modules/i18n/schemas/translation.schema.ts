import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranslationDocument = Translation & Document;

@Schema({ timestamps: true })
export class Translation {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true })
  ar!: string;

  @Prop({ required: true })
  en!: string;

  @Prop({ 
    required: true, 
    enum: ['common', 'auth', 'products', 'orders', 'services', 'users', 'settings', 'errors', 'validation', 'notifications'],
    default: 'common',
    index: true
  })
  namespace!: string;

  @Prop()
  description!: string;

  @Prop({ index: true })
  updatedBy!: string;

  
  @Prop({ type: Array, default: [] })
  history!: Array<{
    action: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    userId: string;
    timestamp: Date;
  }>;
}

export const TranslationSchema = SchemaFactory.createForClass(Translation);

// Create indexes
TranslationSchema.index({ namespace: 1, key: 1 });
TranslationSchema.index({ updatedAt: -1 });

// Text index for search
TranslationSchema.index({ key: 'text', ar: 'text', en: 'text' });

// Pre-save middleware to track changes
TranslationSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    const modifiedPaths = this.modifiedPaths();
    const changes = modifiedPaths
      .filter((path) => !['updatedAt', 'history', '__v'].includes(path))
      .map((path) => ({
        field: path,
        oldValue: this.get(path, null, { getters: false }),
        newValue: this.get(path),
      }));

    if (changes.length > 0) {
      if (!this.history) {
        this.history = [];
      }

      this.history.push({
        action: 'updated',
        changes,
        userId: this.updatedBy || 'system',
        timestamp: new Date(),
      });

      // Keep only last 50 history entries
      if (this.history.length > 50) {
        this.history = this.history.slice(-50);
      }
    }
  }

  next();
});

