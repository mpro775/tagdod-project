import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TejoKbEmbeddingDocument = HydratedDocument<TejoKbEmbedding>;

@Schema({ timestamps: true, collection: 'tejo_kb_embeddings' })
export class TejoKbEmbedding {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [Number], required: true })
  vector!: number[];

  @Prop({ required: true })
  model!: string;

  @Prop({ default: '' })
  locale!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const TejoKbEmbeddingSchema = SchemaFactory.createForClass(TejoKbEmbedding);
TejoKbEmbeddingSchema.index({ updatedAt: -1 });

