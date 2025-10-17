import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  clickAction?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high'])
  priority?: 'low' | 'normal' | 'high';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class SendNotificationDto extends CreateNotificationDto {
  @IsObject()
  target!: {
    userIds?: string[];
    userGroups?: string[];
    topics?: string[];
    fcmTokens?: string[];
    phoneNumbers?: string[];
    emailAddresses?: string[];
  };

  @IsObject()
  channels!: {
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  };
}

export class NotificationTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsObject()
  channels!: {
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  };

  @IsOptional()
  @IsEnum(['welcome', 'order', 'promotion', 'alert', 'reminder', 'custom'])
  type?: 'welcome' | 'order' | 'promotion' | 'alert' | 'reminder' | 'custom';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  variables?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'date';
      required: boolean;
      defaultValue?: unknown;
      description?: string;
    }
  >;

  @IsOptional()
  @IsObject()
  exampleData?: Record<string, unknown>;
}
