import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeValueDto, UpdateAttributeValueDto } from './dto/attribute.dto';
import { Attribute } from './schemas/attribute.schema';
import { AttributeValue } from './schemas/attribute-value.schema';

@ApiTags('إدارة-السمات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/attributes')
export class AttributesAdminController {
  constructor(private attributesService: AttributesService) {}

  // ==================== Attributes ====================

  @RequirePermissions(AdminPermission.ATTRIBUTES_CREATE, AdminPermission.ADMIN_ACCESS)
  @Post()
  @ApiOperation({
    summary: 'إنشاء سمة جديدة',
    description: 'إنشاء سمة جديدة في النظام. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السمات']
  })
  @ApiBody({
    type: CreateAttributeDto,
    description: 'بيانات السمة الجديدة',
    examples: {
      color: {
        summary: 'إنشاء سمة اللون',
        value: {
          name: 'اللون',
          nameEn: 'Color',
          type: 'select',
          description: 'لون المنتج',
          order: 1,
          isFilterable: true,
          isRequired: false,
          showInFilters: true,
          groupId: '64a1b2c3d4e5f6789abcdef1'
        }
      },
      size: {
        summary: 'إنشاء سمة المقاس',
        value: {
          name: 'المقاس',
          nameEn: 'Size',
          type: 'select',
          description: 'مقاس المنتج',
          order: 2,
          isFilterable: true,
          isRequired: true,
          showInFilters: true
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'اللون' },
            nameEn: { type: 'string', example: 'Color' },
            slug: { type: 'string', example: 'color' },
            type: { type: 'string', example: 'select' },
            description: { type: 'string', example: 'لون المنتج' },
            order: { type: 'number', example: 1 },
            isActive: { type: 'boolean', example: true },
            isFilterable: { type: 'boolean', example: true },
            isRequired: { type: 'boolean', example: false },
            showInFilters: { type: 'boolean', example: true },
            groupId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
            usageCount: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح - مطلوب تسجيل دخول',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'ممنوع - مطلوب صلاحيات إدارية',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  async createAttribute(@Body() dto: CreateAttributeDto) {
    const attribute = await this.attributesService.createAttribute(dto as Partial<Attribute>);
    return attribute;
  }

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة السمات',
    description: 'الحصول على قائمة بجميع السمات مع إمكانية التصفية والبحث.',
    tags: ['إدارة السمات']
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'البحث في أسماء السمات',
    example: 'لون'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'تصفية السمات النشطة',
    example: true
  })
  @ApiQuery({
    name: 'isFilterable',
    required: false,
    description: 'تصفية السمات القابلة للفلترة',
    example: true
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'تصفية السمات حسب المجموعة',
    example: '64a1b2c3d4e5f6789abcdef1'
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'تضمين السمات المحذوفة',
    example: false
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة السمات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'اللون' },
              nameEn: { type: 'string', example: 'Color' },
              slug: { type: 'string', example: 'color' },
              type: { type: 'string', example: 'select' },
              description: { type: 'string', example: 'لون المنتج' },
              order: { type: 'number', example: 1 },
              isActive: { type: 'boolean', example: true },
              isFilterable: { type: 'boolean', example: true },
              isRequired: { type: 'boolean', example: false },
              showInFilters: { type: 'boolean', example: true },
              groupId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
              usageCount: { type: 'number', example: 25 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح - مطلوب تسجيل دخول'
  })
  @ApiForbiddenResponse({
    description: 'ممنوع - مطلوب صلاحيات إدارية'
  })
  async listAttributes(@Query() query: Record<string, unknown>) {
    const attributes = await this.attributesService.listAttributes(query);
    return attributes;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على سمة واحدة',
    description: 'الحصول على تفاصيل سمة محددة مع قيمها.',
    tags: ['إدارة السمات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السمة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم الحصول على السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'اللون' },
            nameEn: { type: 'string', example: 'Color' },
            slug: { type: 'string', example: 'color' },
            type: { type: 'string', example: 'select' },
            description: { type: 'string', example: 'لون المنتج' },
            order: { type: 'number', example: 1 },
            isActive: { type: 'boolean', example: true },
            isFilterable: { type: 'boolean', example: true },
            isRequired: { type: 'boolean', example: false },
            showInFilters: { type: 'boolean', example: true },
            groupId: { type: 'object', example: { _id: '64a1b2c3d4e5f6789abcdef1', name: 'الخصائص الفيزيائية' } },
            usageCount: { type: 'number', example: 25 },
            values: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef2' },
                  value: { type: 'string', example: 'أحمر' },
                  valueEn: { type: 'string', example: 'Red' },
                  slug: { type: 'string', example: 'red' },
                  hexCode: { type: 'string', example: '#FF0000' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'السمة غير موجودة'
  })
  async getAttribute(@Param('id') id: string) {
    const attribute = await this.attributesService.getAttribute(id);
    return attribute;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'تحديث سمة',
    description: 'تحديث بيانات سمة موجودة.',
    tags: ['إدارة السمات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السمة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiBody({
    type: UpdateAttributeDto,
    description: 'البيانات المحدثة للسمة'
  })
  @ApiOkResponse({
    description: 'تم تحديث السمة بنجاح'
  })
  @ApiNotFoundResponse({
    description: 'السمة غير موجودة'
  })
  async updateAttribute(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto
  ) {
    const attribute = await this.attributesService.updateAttribute(id, dto as Partial<Attribute>);
    return attribute;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف سمة',
    description: 'حذف سمة (حذف منطقي - Soft Delete). لا يمكن حذف السمات المستخدمة في المنتجات.',
    tags: ['إدارة السمات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السمة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم حذف السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'boolean', example: true },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'السمة غير موجودة'
  })
  async deleteAttribute(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const attribute = await this.attributesService.deleteAttribute(id, req.user.sub);
    return { deleted: true, deletedAt: attribute.deletedAt };
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'استعادة سمة محذوفة',
    description: 'استعادة سمة تم حذفها مسبقاً (حذف منطقي).',
    tags: ['إدارة السمات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السمة المحذوفة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم استعادة السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            restored: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'السمة غير موجودة أو غير محذوفة'
  })
  async restoreAttribute(@Param('id') id: string) {
    await this.attributesService.restoreAttribute(id);
    return { restored: true };
  }

  // ==================== Attribute Values ====================

  @Post(':attributeId/values')
  @ApiOperation({
    summary: 'إضافة قيمة جديدة للسمة',
    description: 'إضافة قيمة جديدة إلى سمة موجودة.',
    tags: ['إدارة السمات - القيم']
  })
  @ApiParam({
    name: 'attributeId',
    description: 'معرف السمة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiBody({
    type: CreateAttributeValueDto,
    description: 'بيانات القيمة الجديدة',
    examples: {
      color: {
        summary: 'إضافة لون أحمر',
        value: {
          value: 'أحمر',
          valueEn: 'Red',
          hexCode: '#FF0000',
          order: 1,
          description: 'اللون الأحمر'
        }
      },
      size: {
        summary: 'إضافة مقاس كبير',
        value: {
          value: 'كبير',
          valueEn: 'Large',
          order: 3,
          description: 'المقاس الكبير'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'تم إضافة القيمة بنجاح'
  })
  @ApiNotFoundResponse({
    description: 'السمة غير موجودة'
  })
  async createValue(
    @Param('attributeId') attributeId: string,
    @Body() dto: CreateAttributeValueDto
  ) {
    const value = await this.attributesService.createValue(attributeId, dto as Partial<AttributeValue>);
    return value;
  }

  @Get(':attributeId/values')
  @ApiOperation({
    summary: 'الحصول على قيم السمة',
    description: 'الحصول على جميع قيم سمة محددة.',
    tags: ['إدارة السمات - القيم']
  })
  @ApiParam({
    name: 'attributeId',
    description: 'معرف السمة',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم الحصول على قيم السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef2' },
              value: { type: 'string', example: 'أحمر' },
              valueEn: { type: 'string', example: 'Red' },
              slug: { type: 'string', example: 'red' },
              hexCode: { type: 'string', example: '#FF0000' },
              imageUrl: { type: 'string', example: 'https://example.com/red.jpg' },
              description: { type: 'string', example: 'اللون الأحمر' },
              order: { type: 'number', example: 1 },
              isActive: { type: 'boolean', example: true },
              usageCount: { type: 'number', example: 10 },
              attributeId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  async listValues(@Param('attributeId') attributeId: string) {
    const values = await this.attributesService.listValues(attributeId);
    return values;
  }

  @Patch('values/:id')
  @ApiOperation({
    summary: 'تحديث قيمة السمة',
    description: 'تحديث بيانات قيمة سمة موجودة.',
    tags: ['إدارة السمات - القيم']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قيمة السمة',
    example: '64a1b2c3d4e5f6789abcdef2'
  })
  @ApiBody({
    type: UpdateAttributeValueDto,
    description: 'البيانات المحدثة للقيمة'
  })
  @ApiOkResponse({
    description: 'تم تحديث القيمة بنجاح'
  })
  @ApiNotFoundResponse({
    description: 'قيمة السمة غير موجودة'
  })
  async updateValue(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeValueDto
  ) {
    const value = await this.attributesService.updateValue(id, dto as Partial<AttributeValue>);
    return value;
  }

  @Delete('values/:id')
  @ApiOperation({
    summary: 'حذف قيمة السمة',
    description: 'حذف قيمة سمة (حذف منطقي). لا يمكن حذف القيم المستخدمة في المنتجات.',
    tags: ['إدارة السمات - القيم']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قيمة السمة',
    example: '64a1b2c3d4e5f6789abcdef2'
  })
  @ApiOkResponse({
    description: 'تم حذف القيمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'قيمة السمة غير موجودة'
  })
  async deleteValue(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    await this.attributesService.deleteValue(id, req.user.sub);
    return { deleted: true };
  }

  // ==================== Stats ====================

  @Get('stats/summary')
  @ApiOperation({
    summary: 'إحصائيات السمات',
    description: 'الحصول على إحصائيات شاملة عن السمات في النظام.',
    tags: ['إدارة السمات - الإحصائيات']
  })
  @ApiOkResponse({
    description: 'تم الحصول على الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50, description: 'إجمالي عدد السمات' },
            active: { type: 'number', example: 45, description: 'عدد السمات النشطة' },
            filterable: { type: 'number', example: 30, description: 'عدد السمات القابلة للفلترة' },
            byType: {
              type: 'object',
              properties: {
                select: { type: 'number', example: 25 },
                multiselect: { type: 'number', example: 10 },
                text: { type: 'number', example: 8 },
                number: { type: 'number', example: 5 },
                boolean: { type: 'number', example: 2 }
              },
              description: 'توزيع السمات حسب النوع'
            }
          }
        }
      }
    }
  })
  async getStats() {
    return this.attributesService.getStats();
  }
}

