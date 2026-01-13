// src/inventory/schemas/external-stock.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExternalStockDocument = HydratedDocument<ExternalStock>;

@Schema({ timestamps: true })
export class ExternalStock {
    @Prop({ required: true, unique: true, index: true })
    sku!: string; // مفتاح الربط (ITEM_ID من أونكس)

    @Prop({ required: true, default: 0 })
    quantity!: number; // (ITEM_STOCK)

    // ✅ حقل السعر القادم من أونكس
    @Prop({ default: 0 })
    price!: number;

    @Prop()
    itemNameAr?: string; // (للعرض فقط في التقارير)

    @Prop()
    storeId?: number; // (مثلاً 6)

    @Prop({ type: Date, default: Date.now })
    lastSyncedAt!: Date;
}

export const ExternalStockSchema = SchemaFactory.createForClass(ExternalStock);