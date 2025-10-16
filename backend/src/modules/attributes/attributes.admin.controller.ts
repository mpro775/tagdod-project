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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeValueDto, UpdateAttributeValueDto } from './dto/attribute.dto';
import { Attribute } from './schemas/attribute.schema';
import { AttributeValue } from './schemas/attribute-value.schema';

@ApiTags('admin-attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/attributes')
export class AttributesAdminController {
  constructor(private attributesService: AttributesService) {}

  // ==================== Attributes ====================

  @Post()
  async createAttribute(@Body() dto: CreateAttributeDto) {
    const attribute = await this.attributesService.createAttribute(dto as Partial<Attribute>);
    return { data: attribute };
  }

  @Get()
  async listAttributes(@Query() query: Record<string, unknown>) {
    const attributes = await this.attributesService.listAttributes(query);
    return { data: attributes };
  }

  @Get(':id')
  async getAttribute(@Param('id') id: string) {
    const attribute = await this.attributesService.getAttribute(id);
    return { data: attribute };
  }

  @Patch(':id')
  async updateAttribute(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto
  ) {
    const attribute = await this.attributesService.updateAttribute(id, dto as Partial<Attribute>);
    return { data: attribute };
  }

  @Delete(':id')
  async deleteAttribute(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const attribute = await this.attributesService.deleteAttribute(id, req.user.sub);
    return { data: { deleted: true, deletedAt: attribute.deletedAt } };
  }

  @Post(':id/restore')
  async restoreAttribute(@Param('id') id: string) {
    await this.attributesService.restoreAttribute(id);
    return { data: { restored: true } };
  }

  // ==================== Attribute Values ====================

  @Post(':attributeId/values')
  async createValue(
    @Param('attributeId') attributeId: string,
    @Body() dto: CreateAttributeValueDto
  ) {
    const value = await this.attributesService.createValue(attributeId, dto as Partial<AttributeValue>);
    return { data: value };
  }

  @Get(':attributeId/values')
  async listValues(@Param('attributeId') attributeId: string) {
    const values = await this.attributesService.listValues(attributeId);
    return { data: values };
  }

  @Patch('values/:id')
  async updateValue(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeValueDto
  ) {
    const value = await this.attributesService.updateValue(id, dto as Partial<AttributeValue>);
    return { data: value };
  }

  @Delete('values/:id')
  async deleteValue(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    await this.attributesService.deleteValue(id, req.user.sub);
    return { data: { deleted: true } };
  }

  // ==================== Stats ====================

  @Get('stats/summary')
  async getStats() {
    return this.attributesService.getStats();
  }
}

