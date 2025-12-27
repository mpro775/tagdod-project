// src/products/dto/sync-stock.dto.ts
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StockItemDto {
    @IsString()
    sku!: string;

    @IsNumber()
    stock!: number;
}

export class SyncStockDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockItemDto)
    items!: StockItemDto[];
}