import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemMetricDocument = SystemMetric & Document;

@Schema({ timestamps: true })
export class SystemMetric {
  @Prop({ required: true, index: true })
  metricType!: string; // cpu, memory, disk, database, redis, api

  @Prop({ required: true })
  value!: number;

  @Prop({ type: Object })
  metadata!: Record<string, unknown>;

  @Prop({ default: Date.now, index: true })
  timestamp!: Date;

  @Prop({ type: Object })
  details!: {
    cpu?: {
      usage: number;
      cores: number;
      load: number[];
    };
    memory?: {
      total: number;
      used: number;
      free: number;
      usagePercentage: number;
    };
    disk?: {
      total: number;
      used: number;
      free: number;
      usagePercentage: number;
    };
    database?: {
      responseTime: number;
      activeConnections: number;
      operationsPerSecond: number;
    };
    redis?: {
      responseTime: number;
      hitRate: number;
      memoryUsage: number;
    };
    api?: {
      totalRequests: number;
      avgResponseTime: number;
      errorRate: number;
    };
  };
}

export const SystemMetricSchema = SchemaFactory.createForClass(SystemMetric);

// Create indexes
SystemMetricSchema.index({ metricType: 1, timestamp: -1 });
SystemMetricSchema.index({ timestamp: -1 });

// TTL index - automatically delete metrics older than 90 days
SystemMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

