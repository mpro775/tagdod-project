import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { PolicyResponseDto } from './dto/policy.dto';
import { PolicyType } from './schemas/policy.schema';

@ApiTags('السياسات-العامة')
@Controller('policies/public')
export class PoliciesPublicController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get('terms')
  @ApiOperation({
    summary: 'جلب الأحكام والشروط',
    description: 'الحصول على سياسة الأحكام والشروط النشطة (عام - بدون مصادقة)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الأحكام والشروط بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'لا توجد سياسة نشطة' })
  async getTermsAndConditions(): Promise<PolicyResponseDto> {
    return this.policiesService.getPolicyByType(PolicyType.TERMS);
  }

  @Get('privacy')
  @ApiOperation({
    summary: 'جلب سياسة الخصوصية',
    description: 'الحصول على سياسة الخصوصية النشطة (عام - بدون مصادقة)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب سياسة الخصوصية بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'لا توجد سياسة نشطة' })
  async getPrivacyPolicy(): Promise<PolicyResponseDto> {
    return this.policiesService.getPolicyByType(PolicyType.PRIVACY);
  }

  @Get(':type')
  @ApiOperation({
    summary: 'جلب سياسة حسب النوع',
    description: 'الحصول على سياسة معينة حسب النوع (عام - بدون مصادقة)',
  })
  @ApiParam({ name: 'type', enum: PolicyType, description: 'نوع السياسة' })
  @ApiResponse({
    status: 200,
    description: 'تم جلب السياسة بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'لا توجد سياسة نشطة' })
  async getPolicyByType(@Param('type') type: PolicyType): Promise<PolicyResponseDto> {
    return this.policiesService.getPolicyByType(type);
  }
}
