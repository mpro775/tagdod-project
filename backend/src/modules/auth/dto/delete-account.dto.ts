import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    description: 'سبب حذف الحساب (ملاحظة)',
    example: 'لا أستخدم التطبيق بعد الآن',
    minLength: 5,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'يجب إدخال سبب حذف الحساب' })
  @MinLength(5, { message: 'يجب أن يكون السبب 5 أحرف على الأقل' })
  @MaxLength(500, { message: 'يجب أن يكون السبب 500 حرف على الأكثر' })
  reason!: string;
}

