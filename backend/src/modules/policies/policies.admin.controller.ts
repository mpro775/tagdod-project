import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto, UpdatePolicyDto, TogglePolicyDto, PolicyResponseDto } from './dto/policy.dto';
import { PolicyType } from './schemas/policy.schema';

interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('إدارة-السياسات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/policies')
export class PoliciesAdminController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({
    summary: 'جلب جميع السياسات',
    description: 'الحصول على جميع السياسات (للأدمن)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب السياسات بنجاح',
    type: [PolicyResponseDto],
  })
  async getAllPolicies(): Promise<PolicyResponseDto[]> {
    return this.policiesService.getAllPolicies();
  }

  @Post()
  @ApiOperation({
    summary: 'إنشاء سياسة جديدة',
    description: 'إنشاء سياسة جديدة من لوحة التحكم (terms أو privacy)',
  })
  @ApiBody({ type: CreatePolicyDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء السياسة بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'سياسة من نفس النوع موجودة بالفعل' })
  async createPolicy(
    @Body() dto: CreatePolicyDto,
    @Req() req: RequestWithUser,
  ): Promise<PolicyResponseDto> {
    return this.policiesService.createPolicy(dto, req.user.sub);
  }

  @Get(':type')
  @ApiOperation({
    summary: 'جلب سياسة حسب النوع',
    description: 'الحصول على سياسة معينة حسب النوع (terms أو privacy)',
  })
  @ApiParam({ name: 'type', enum: PolicyType, description: 'نوع السياسة' })
  @ApiResponse({
    status: 200,
    description: 'تم جلب السياسة بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'السياسة غير موجودة' })
  async getPolicyByType(
    @Param('type', new ParseEnumPipe(PolicyType)) type: PolicyType,
  ): Promise<PolicyResponseDto> {
    return this.policiesService.getPolicyByTypeForAdmin(type);
  }

  @Put(':type')
  @ApiOperation({
    summary: 'تحديث سياسة',
    description: 'تحديث سياسة معينة حسب النوع',
  })
  @ApiParam({ name: 'type', enum: PolicyType, description: 'نوع السياسة' })
  @ApiBody({ type: UpdatePolicyDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث السياسة بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'السياسة غير موجودة' })
  async updatePolicy(
    @Param('type', new ParseEnumPipe(PolicyType)) type: PolicyType,
    @Body() dto: UpdatePolicyDto,
    @Req() req: RequestWithUser,
  ): Promise<PolicyResponseDto> {
    return this.policiesService.updatePolicy(type, dto, req.user.sub);
  }

  @Post(':type/toggle')
  @ApiOperation({
    summary: 'تفعيل/تعطيل سياسة',
    description: 'تفعيل أو تعطيل سياسة معينة',
  })
  @ApiParam({ name: 'type', enum: PolicyType, description: 'نوع السياسة' })
  @ApiBody({ type: TogglePolicyDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث حالة السياسة بنجاح',
    type: PolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'السياسة غير موجودة' })
  async togglePolicy(
    @Param('type', new ParseEnumPipe(PolicyType)) type: PolicyType,
    @Body() dto: TogglePolicyDto,
    @Req() req: RequestWithUser,
  ): Promise<PolicyResponseDto> {
    return this.policiesService.togglePolicy(type, dto.isActive, req.user.sub);
  }
}
