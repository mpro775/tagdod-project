import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto, UpdateItemDto, DeviceDto, PreviewDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private svc: CartService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user cart',
    description: 'Retrieves the current user shopping cart with all items'
  })
  @ApiOkResponse({ 
    description: 'Cart retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
                  quantity: { type: 'number', example: 2 },
                  product: { type: 'object' },
                  variant: { type: 'object' }
                }
              }
            },
            totalItems: { type: 'number', example: 3 },
            totalPrice: { type: 'number', example: 599.98 },
            currency: { type: 'string', example: 'USD' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async get(@Req() req: { user: { sub: string } }) {
    return { data: await this.svc.getUserCart(req.user.sub) };
  }

  @Post('items')
  @ApiOperation({ 
    summary: 'Add item to cart',
    description: 'Adds a product variant to the user shopping cart'
  })
  @ApiBody({ type: AddItemDto })
  @ApiOkResponse({ 
    description: 'Item added to cart successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
            quantity: { type: 'number', example: 2 },
            product: { type: 'object' },
            variant: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid variant ID or quantity' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async add(@Req() req: { user: { sub: string } }, @Body() dto: AddItemDto) {
    const data = await this.svc.addUserItem(req.user.sub, dto.variantId, dto.qty);
    return { data };
  }

  @Patch('items/:itemId')
  async update(
    @Req() req: { user: { sub: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    const data = await this.svc.updateUserItem(req.user.sub, itemId, dto.qty);
    return { data };
  }

  @Delete('items/:itemId')
  async remove(@Req() req: { user: { sub: string } }, @Param('itemId') itemId: string) {
    const data = await this.svc.removeUserItem(req.user.sub, itemId);
    return { data };
  }

  @Post('merge')
  async merge(@Req() req: { user: { sub: string } }, @Body() body: DeviceDto) {
    const data = await this.svc.merge(body.deviceId, req.user.sub);
    return { data };
  }

  @Post('preview')
  async preview(@Req() req: { user: { sub: string } }, @Body() dto: PreviewDto) {
    const data = await this.svc.previewUser(req.user.sub, dto.currency, 'any');
    return { data };
  }
}
