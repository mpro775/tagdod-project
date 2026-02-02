import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppVersionPolicyDocument = AppVersionPolicy & Document;

const PlatformPolicySchemaDefinition = {
  minVersion: { type: String, required: true, default: '1.0.0' },
  latestVersion: { type: String, required: true, default: '1.0.0' },
  updateUrl: { type: String, default: '' },
  blockedVersions: { type: [String], default: [] },
};

@Schema({ timestamps: true })
export class AppVersionPolicy {
  @Prop({ required: true, unique: true, default: 'default', index: true })
  policyId!: string;

  @Prop({ required: true, default: '1.0.0' })
  minVersion!: string;

  @Prop({ required: true, default: '1.0.0' })
  latestVersion!: string;

  @Prop({ type: [String], default: [] })
  blockedVersions!: string[];

  @Prop({ default: false })
  forceUpdate!: boolean;

  @Prop({ default: false })
  maintenanceMode!: boolean;

  @Prop({ default: '' })
  updateUrl!: string;

  @Prop({ type: PlatformPolicySchemaDefinition, required: false })
  android?: {
    minVersion: string;
    latestVersion: string;
    updateUrl: string;
    blockedVersions: string[];
  };

  @Prop({ type: PlatformPolicySchemaDefinition, required: false })
  ios?: {
    minVersion: string;
    latestVersion: string;
    updateUrl: string;
    blockedVersions: string[];
  };
}

export const AppVersionPolicySchema = SchemaFactory.createForClass(AppVersionPolicy);
