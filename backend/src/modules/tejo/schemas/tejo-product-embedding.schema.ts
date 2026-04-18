import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TejoProductEmbeddingDocument = HydratedDocument<TejoProductEmbedding>;

@Schema({ timestamps: true, collection: 'tejo_product_embeddings' })
export class TejoProductEmbedding {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true, index: true })
  productId!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [Number], required: true })
  vector!: number[];

  @Prop({ required: true })
  model!: string;

  @Prop({ default: '' })
  locale!: string;

  @Prop({ default: 0 })
  tokenCount!: number;
}

export const TejoProductEmbeddingSchema = SchemaFactory.createForClass(TejoProductEmbedding);
TejoProductEmbeddingSchema.index({ updatedAt: -1 });

