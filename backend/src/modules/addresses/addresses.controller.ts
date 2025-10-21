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

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include soft-deleted addresses' })
  @ApiOkResponse({ description: 'Addresses fetched successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async list(@Req() req: RequestWithUser, @Query('includeDeleted') includeDeleted?: string) {
    const addresses = await this.addressesService.list(
      req.user!.sub,
      includeDeleted === 'true',
    );

    return {
      success: true,
      data: addresses,
      count: addresses.length,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active addresses only' })
  @ApiOkResponse({ description: 'Active addresses fetched successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getActive(@Req() req: RequestWithUser) {
    const addresses = await this.addressesService.getActiveAddresses(req.user!.sub);

    return {
      success: true,
      data: addresses,
      count: addresses.length,
    };
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address' })
  @ApiOkResponse({ description: 'Default address fetched successfully (or null if none)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getDefault(@Req() req: RequestWithUser) {
    const address = await this.addressesService.getDefault(req.user!.sub);

    if (!address) {
      return {
        success: false,
        message: 'No addresses found. Please add an address first.',
        data: null,
      };
    }

    return {
      success: true,
      data: address,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address fetched successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAddress(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.get(req.user!.sub, id);

    return {
      success: true,
      data: address,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  @ApiCreatedResponse({ description: 'Address created successfully' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateAddressDto) {
    const address = await this.addressesService.create(req.user!.sub, dto);

    return {
      success: true,
      message: 'Address created successfully',
      data: address,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.update(req.user!.sub, id, dto);

    return {
      success: true,
      message: 'Address updated successfully',
      data: address,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address (soft delete)' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const result = await this.addressesService.remove(req.user!.sub, id);

    return {
      success: true,
      message: 'Address deleted successfully',
      data: result,
    };
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Default address set successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async setDefault(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.setDefault(req.user!.sub, id);

    return {
      success: true,
      message: 'Default address set successfully',
      data: address,
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address restored successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async restore(@Req() req: RequestWithUser, @Param('id') id: string) {
    const address = await this.addressesService.restore(req.user!.sub, id);

    return {
      success: true,
      message: 'Address restored successfully',
      data: address,
    };
  }

  @Get('validate/:id')
  @ApiOperation({ summary: 'Validate address ownership' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Ownership validation result' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async validateOwnership(@Req() req: RequestWithUser, @Param('id') id: string) {
    const isValid = await this.addressesService.validateAddressOwnership(
      id,
          req.user!.sub,
    );

    return {
      success: true,
      data: { valid: isValid },
    };
  }
}
