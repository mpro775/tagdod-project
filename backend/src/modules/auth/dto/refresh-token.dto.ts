import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'رمز التجديد (Refresh Token)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString({ message: 'رمز التجديد يجب أن يكون نصاً' })
    @IsNotEmpty({ message: 'رمز التجديد مطلوب' })
    refreshToken!: string;
}
