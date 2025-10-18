import { ApiProperty } from '@nestjs/swagger';

// ==================== Common Response Examples ====================

export class SuccessResponseDto {
  @ApiProperty({ 
    example: true, 
    description: 'Indicates if the operation was successful' 
  })
  success: boolean;

  @ApiProperty({ 
    example: 'Operation completed successfully', 
    description: 'Success message' 
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ 
    example: 400, 
    description: 'HTTP status code' 
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'Validation failed', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({ 
    example: 'Bad Request', 
    description: 'Error type' 
  })
  error: string;
}

// ==================== Pagination Examples ====================

export class PaginationDto {
  @ApiProperty({ 
    example: 1, 
    description: 'Current page number' 
  })
  page: number;

  @ApiProperty({ 
    example: 20, 
    description: 'Items per page' 
  })
  limit: number;

  @ApiProperty({ 
    example: 150, 
    description: 'Total number of items' 
  })
  total: number;

  @ApiProperty({ 
    example: 8, 
    description: 'Total number of pages' 
  })
  pages: number;
}

// ==================== User Examples ====================

export class UserDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'User unique identifier' 
  })
  id: string;

  @ApiProperty({ 
    example: '+966501234567', 
    description: 'User phone number' 
  })
  phone: string;

  @ApiProperty({ 
    example: 'أحمد', 
    description: 'User first name' 
  })
  firstName: string;

  @ApiProperty({ 
    example: 'محمد', 
    description: 'User last name' 
  })
  lastName: string;

  @ApiProperty({ 
    example: 'male', 
    enum: ['male', 'female'], 
    description: 'User gender' 
  })
  gender: string;

  @ApiProperty({ 
    example: 'مهندس كهرباء', 
    description: 'User job title (for engineers)' 
  })
  jobTitle?: string;

  @ApiProperty({ 
    example: false, 
    description: 'Whether user is admin' 
  })
  isAdmin: boolean;

  @ApiProperty({ 
    example: 'USD', 
    description: 'User preferred currency' 
  })
  preferredCurrency: string;
}

// ==================== Product Examples ====================

export class ProductDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Product unique identifier' 
  })
  id: string;

  @ApiProperty({ 
    example: 'Solar Panel 300W', 
    description: 'Product name' 
  })
  name: string;

  @ApiProperty({ 
    example: 'High efficiency solar panel with 20% efficiency', 
    description: 'Product description' 
  })
  description: string;

  @ApiProperty({ 
    example: 299.99, 
    description: 'Product price' 
  })
  price: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Product currency' 
  })
  currency: string;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], 
    type: [String], 
    description: 'Product images URLs' 
  })
  images: string[];

  @ApiProperty({ 
    example: true, 
    description: 'Whether product is featured' 
  })
  isFeatured: boolean;

  @ApiProperty({ 
    example: false, 
    description: 'Whether product is new' 
  })
  isNew: boolean;

  @ApiProperty({ 
    example: 150, 
    description: 'Product view count' 
  })
  views: number;
}

// ==================== Cart Examples ====================

export class CartItemDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'Cart item unique identifier' 
  })
  id: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439014', 
    description: 'Product variant ID' 
  })
  variantId: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Item quantity' 
  })
  quantity: number;

  @ApiProperty({ 
    type: ProductDto, 
    description: 'Product information' 
  })
  product: ProductDto;

  @ApiProperty({ 
    example: { 
      id: '507f1f77bcf86cd799439014',
      name: '300W - Black',
      price: 299.99,
      stock: 50
    }, 
    description: 'Product variant information' 
  })
  variant: any;
}

export class CartDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Cart unique identifier' 
  })
  id: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439012', 
    description: 'User ID who owns the cart' 
  })
  userId: string;

  @ApiProperty({ 
    type: [CartItemDto], 
    description: 'Cart items' 
  })
  items: CartItemDto[];

  @ApiProperty({ 
    example: 3, 
    description: 'Total number of items in cart' 
  })
  totalItems: number;

  @ApiProperty({ 
    example: 599.98, 
    description: 'Total cart price' 
  })
  totalPrice: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Cart currency' 
  })
  currency: string;
}

// ==================== Order Examples ====================

export class OrderDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Order unique identifier' 
  })
  id: string;

  @ApiProperty({ 
    example: 'ORD-2024-001', 
    description: 'Order number' 
  })
  orderNumber: string;

  @ApiProperty({ 
    example: 'pending', 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    description: 'Order status' 
  })
  status: string;

  @ApiProperty({ 
    example: 599.98, 
    description: 'Order total amount' 
  })
  totalAmount: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Order currency' 
  })
  currency: string;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Order creation date' 
  })
  createdAt: string;
}

// ==================== Analytics Examples ====================

export class AnalyticsDto {
  @ApiProperty({ 
    example: '2024-01-15', 
    description: 'Analytics date' 
  })
  date: string;

  @ApiProperty({ 
    example: 150, 
    description: 'Total page views' 
  })
  pageViews: number;

  @ApiProperty({ 
    example: 25, 
    description: 'Total orders' 
  })
  orders: number;

  @ApiProperty({ 
    example: 12500.50, 
    description: 'Total revenue' 
  })
  revenue: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Revenue currency' 
  })
  currency: string;
}
