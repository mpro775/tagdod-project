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
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

// JWT Payload interface
interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

// Request with JWT user
interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('العناوين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على جميع عناوين المستخدم' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'تضمين العناوين المحذوفة مؤقتاً' })
  @ApiOkResponse({ description: 'تم جلب العناوين بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async list(@Req() req: RequestWithUser, @Query('includeDeleted') includeDeleted?: string) {
    const addresses = await this.addressesService.list(
      req.user!.sub,
      includeDeleted === 'true',
    );

    return {
      addresses,
      count: addresses.length,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'الحصول على العناوين النشطة فقط' })
  @ApiOkResponse({ description: 'تم جلب العناوين النشطة بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async getActive(@Req() req: RequestWithUser) {
    const addresses = await this.addressesService.getActiveAddresses(req.user!.sub);

    return {
      addresses,
      count: addresses.length,
    };
  }

  @Get('default')
  @ApiOperation({ summary: 'الحصول على العنوان الافتراضي' })
  @ApiOkResponse({ description: 'تم جلب العنوان الافتراضي بنجاح (أو null إذا لم يكن موجوداً)' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async getDefault(@Req() req: RequestWithUser) {
    const address = await this.addressesService.getDefault(req.user!.sub);

    if (!address) {
      return {
        address: null,
        message: 'No addresses found. Please add an address first.',
      };
    }

    return { address };
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على عنوان بالمعرف' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'تم جلب العنوان بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async getAddress(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.get(req.user!.sub, id);

    return { address };
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء عنوان جديد' })
  @ApiCreatedResponse({ description: 'تم إنشاء العنوان بنجاح' })
  @ApiBadRequestResponse({ description: 'خطأ في التحقق من البيانات' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateAddressDto) {
    const address = await this.addressesService.create(req.user!.sub, dto);

    return {
      address,
      message: 'Address created successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث العنوان' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'تم تحديث العنوان بنجاح' })
  @ApiBadRequestResponse({ description: 'خطأ في التحقق من البيانات' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.update(req.user!.sub, id, dto);

    return {
      address,
      message: 'Address updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف العنوان (حذف مؤقت)' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'تم حذف العنوان بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const result = await this.addressesService.remove(req.user!.sub, id);

    return {
      result,
      message: 'Address deleted successfully',
    };
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'تعيين العنوان كافتراضي' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'تم تعيين العنوان الافتراضي بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async setDefault(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.setDefault(req.user!.sub, id);

    return {
      address,
      message: 'Default address set successfully',
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'استعادة العنوان المحذوف' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'تم استعادة العنوان بنجاح' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async restore(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.restore(req.user!.sub, id);

    return {
      address,
      message: 'Address restored successfully',
    };
  }

  @Get('validate/:id')
  @ApiOperation({ summary: 'التحقق من ملكية العنوان' })
  @ApiParam({ name: 'id', description: 'معرف العنوان' })
  @ApiOkResponse({ description: 'نتيجة التحقق من الملكية' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح له' })
  async validateOwnership(@Req() req: RequestWithUser, @Param('id') id: string) {
    const isValid = await this.addressesService.validateAddressOwnership(
      id,
          req.user!.sub,
    );

    return { valid: isValid };
  }
}
