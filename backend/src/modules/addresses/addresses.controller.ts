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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  async list(@Req() req: Request, @Query('includeDeleted') includeDeleted?: string) {
    const addresses = await this.addressesService.list(
      req.user!.userId,
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
  async getActive(@Req() req: Request) {
    const addresses = await this.addressesService.getActiveAddresses(req.user!.userId);

    return {
      success: true,
      data: addresses,
      count: addresses.length,
    };
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address' })
  async getDefault(@Req() req: Request) {
    const address = await this.addressesService.getDefault(req.user!.userId);

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
  async getAddress(@Req() req: Request, @Param('id') id: string) {
    const address = await this.addressesService.get(req.user!.userId, id);

    return {
      success: true,
      data: address,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  async create(@Req() req: Request, @Body() dto: CreateAddressDto) {
    const address = await this.addressesService.create(req.user!.userId, dto);

    return {
      success: true,
      message: 'Address created successfully',
      data: address,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.update(req.user!.userId, id, dto);

    return {
      success: true,
      message: 'Address updated successfully',
      data: address,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address (soft delete)' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.addressesService.remove(req.user!.userId, id);

    return {
      success: true,
      message: 'Address deleted successfully',
      data: result,
    };
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(@Req() req: Request, @Param('id') id: string) {
    const address = await this.addressesService.setDefault(req.user!.userId, id);

    return {
      success: true,
      message: 'Default address set successfully',
      data: address,
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted address' })
  async restore(@Req() req: Request, @Param('id') id: string) {
    const address = await this.addressesService.restore(req.user!.userId, id);

    return {
      success: true,
      message: 'Address restored successfully',
      data: address,
    };
  }

  @Get('validate/:id')
  @ApiOperation({ summary: 'Validate address ownership' })
  async validateOwnership(@Req() req: Request, @Param('id') id: string) {
    const isValid = await this.addressesService.validateAddressOwnership(
      id,
          req.user!.userId,
    );

    return {
      success: true,
      data: { valid: isValid },
    };
  }
}
