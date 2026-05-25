import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendTestSmsDto {
  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;
}
