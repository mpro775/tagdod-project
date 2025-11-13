import { IsMongoId, IsString } from 'class-validator';

export class RetrySyncJobDto {
  @IsString()
  @IsMongoId()
  productId!: string;
}

