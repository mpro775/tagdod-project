import { ApiProperty } from '@nestjs/swagger';

// ==================== Common API Response Schemas ====================

export class ApiSuccessResponse<T = unknown> {
  @ApiProperty({ 
    example: true, 
    description: 'Indicates if the operation was successful' 
  })
  success!: boolean;

  @ApiProperty({ 
    example: 'Operation completed successfully', 
    description: 'Success message' 
  })
  message!: string;

  @ApiProperty({ 
    description: 'Response data' 
  })
  data!: T;
}

export class ApiErrorResponse {
  @ApiProperty({ 
    example: 400, 
    description: 'HTTP status code' 
  })
  statusCode!: number;

  @ApiProperty({ 
    example: 'Validation failed', 
    description: 'Error message' 
  })
  message!: string;

  @ApiProperty({ 
    example: 'Bad Request', 
    description: 'Error type' 
  })
  error!: string;

  @ApiProperty({ 
    example: ['Field is required'], 
    description: 'Validation errors (if any)' 
  })
  errors?: string[];
}

// ==================== Pagination Response ====================

export class PaginationMetaDto {
  @ApiProperty({ 
    example: 1, 
    description: 'Current page number' 
  })
  page!: number;

  @ApiProperty({ 
    example: 20, 
    description: 'Items per page' 
  })
  limit!: number;

  @ApiProperty({ 
    example: 150, 
    description: 'Total number of items' 
  })
  total!: number;

  @ApiProperty({ 
    example: 8, 
    description: 'Total number of pages' 
  })
  pages!: number;

  @ApiProperty({ 
    example: true, 
    description: 'Whether there is a next page' 
  })
  hasNext!: boolean;

  @ApiProperty({ 
    example: false, 
    description: 'Whether there is a previous page' 
  })
  hasPrev!: boolean;
}

export class PaginatedResponseDto<T = unknown> {
  @ApiProperty({ 
    description: 'Array of items' 
  })
  data!: T[];

  @ApiProperty({ 
    type: PaginationMetaDto, 
    description: 'Pagination metadata' 
  })
  pagination!: PaginationMetaDto;
}

// ==================== Authentication Responses ====================

export class LoginResponseDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'JWT access token' 
  })
  access!: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'JWT refresh token' 
  })
  refresh!: string;
}

export class UserProfileDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'User unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: '+966501234567', 
    description: 'User phone number' 
  })
  phone!: string;

  @ApiProperty({ 
    example: 'أحمد', 
    description: 'User first name' 
  })
  firstName!: string;

  @ApiProperty({ 
    example: 'محمد', 
    description: 'User last name' 
  })
  lastName!: string;

  @ApiProperty({ 
    example: 'male', 
    enum: ['male', 'female'], 
    description: 'User gender' 
  })
  gender!: string;

  @ApiProperty({ 
    example: 'مهندس كهرباء', 
    description: 'User job title (for engineers)' 
  })
  jobTitle?: string;

  @ApiProperty({ 
    example: false, 
    description: 'Whether user is admin' 
  })
  isAdmin!: boolean;

  @ApiProperty({ 
    example: 'USD', 
    description: 'User preferred currency' 
  })
  preferredCurrency!: string;
}

export class AuthResponseDto {
  @ApiProperty({ 
    type: LoginResponseDto, 
    description: 'Authentication tokens' 
  })
  tokens!: LoginResponseDto;

  @ApiProperty({ 
    type: UserProfileDto, 
    description: 'User profile information' 
  })
  me! : UserProfileDto;
}

// ==================== Product Responses ====================

export class ProductVariantDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439014', 
    description: 'Variant unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: '300W - Black', 
    description: 'Variant name' 
  })
  name!: string;

  @ApiProperty({ 
    example: 299.99, 
    description: 'Variant price' 
  })
  price!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Variant currency' 
  })
  currency!: string;

  @ApiProperty({ 
    example: 50, 
    description: 'Available stock quantity' 
  })
  stock!: number;

  @ApiProperty({ 
    example: { color: 'Black', size: '300W' }, 
    description: 'Variant attributes' 
  })
  attributes!: Record<string, string>;
}

export class ProductDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Product unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: 'Solar Panel 300W', 
    description: 'Product name' 
  })
  name!: string;

  @ApiProperty({ 
    example: 'High efficiency solar panel with 20% efficiency', 
    description: 'Product description' 
  })
  description!: string;

  @ApiProperty({ 
    example: 299.99, 
    description: 'Product base price' 
  })
  price!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Product currency' 
  })
  currency!: string;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], 
    type: [String], 
    description: 'Product images URLs' 
  })
  images!: string[];

  @ApiProperty({ 
    type: [ProductVariantDto], 
    description: 'Product variants' 
  })
  variants! : ProductVariantDto[];

  @ApiProperty({ 
    example: { 
      id: '507f1f77bcf86cd799439015',
      name: 'Solar Panels',
      slug: 'solar-panels'
    }, 
    description: 'Product category' 
  })
  category!: Record<string, string>;

  @ApiProperty({ 
    example: { 
      id: '507f1f77bcf86cd799439016',
      name: 'SunPower',
      logo: 'https://example.com/logo.jpg'
    }, 
    description: 'Product brand' 
  })
  brand!: Record<string, string>;

  @ApiProperty({ 
    example: true, 
    description: 'Whether product is featured' 
  })
  isFeatured!: boolean;

  @ApiProperty({ 
    example: false, 
    description: 'Whether product is new' 
  })
  isNew!: boolean;

  @ApiProperty({ 
    example: 150, 
    description: 'Product view count' 
  })
  views!: number;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Product creation date' 
  })
  createdAt!: string;
}

// ==================== Cart Responses ====================

export class CartItemDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'Cart item unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439014', 
    description: 'Product variant ID' 
  })
  variantId!: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Item quantity' 
  })
  quantity!: number;

  @ApiProperty({ 
    type: ProductDto, 
    description: 'Product information' 
  })
  product!: ProductDto;

  @ApiProperty({ 
    type: ProductVariantDto, 
    description: 'Product variant information' 
  })
  variant!: ProductVariantDto;

  @ApiProperty({ 
    example: 599.98, 
    description: 'Total price for this item' 
  })
  totalPrice!: number;
}

export class CartDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Cart unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439012', 
    description: 'User ID who owns the cart' 
  })
  userId!: string;

  @ApiProperty({ 
    type: [CartItemDto], 
    description: 'Cart items' 
  })
  items!: CartItemDto[];

  @ApiProperty({ 
    example: 3, 
    description: 'Total number of items in cart' 
  })
  totalItems!: number;

  @ApiProperty({ 
    example: 599.98, 
    description: 'Total cart price' 
  })
  totalPrice!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Cart currency' 
  })
  currency!: string;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Cart last updated date' 
  })
  updatedAt!: string;
}

// ==================== Order Responses ====================

export class OrderItemDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'Order item unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    type: ProductDto, 
    description: 'Product information' 
  })
  product!: ProductDto;

  @ApiProperty({ 
    type: ProductVariantDto, 
    description: 'Product variant information' 
  })
  variant!: ProductVariantDto;

  @ApiProperty({ 
    example: 2, 
    description: 'Item quantity' 
  })
  quantity!: number;

  @ApiProperty({ 
    example: 299.99, 
    description: 'Item unit price' 
  })
  unitPrice!:  number;

  @ApiProperty({ 
    example: 599.98, 
    description: 'Total price for this item' 
  })
  totalPrice!: number;
}

export class OrderDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Order unique identifier' 
  })
  id!: string;

  @ApiProperty({ 
    example: 'ORD-2024-001', 
    description: 'Order number' 
  })
  orderNumber!: string;

  @ApiProperty({ 
    example: 'pending_payment', 
    enum: ['pending_payment', 'confirmed', 'processing', 'completed', 'on_hold', 'cancelled', 'returned', 'refunded'], 
    description: 'Order status' 
  })
  status!: string;

  @ApiProperty({ 
    type: [OrderItemDto], 
    description: 'Order items' 
  })
  items!: OrderItemDto[];

  @ApiProperty({ 
    example: 599.98, 
    description: 'Order subtotal' 
  })
  subtotal!: number;

  @ApiProperty({ 
    example: 25.00, 
    description: 'Shipping cost' 
  })
  shipping!: number;

  @ApiProperty({ 
    example: 62.50, 
    description: 'Tax amount' 
  })
  tax!: number;

  @ApiProperty({ 
    example: 687.48, 
    description: 'Order total amount' 
  })
  totalAmount!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Order currency' 
  })
  currency!: string;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Order creation date' 
  })
  createdAt!: string;

  @ApiProperty({ 
    example: '2024-01-20T00:00:00Z', 
    description: 'Estimated delivery date' 
  })
  estimatedDelivery?: string;
}

// ==================== Analytics Responses ====================

export class AnalyticsKpiDto {
  @ApiProperty({ 
    example: 'totalRevenue', 
    description: 'KPI metric name' 
  })
  metric!: string;

  @ApiProperty({ 
    example: 125000.50, 
    description: 'Current value' 
  })
  value!: number;

  @ApiProperty({ 
    example: 15.5, 
    description: 'Percentage change from previous period' 
  })
  change!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Value currency' 
  })
  currency?: string;
}

export class ChartDataPointDto {
  @ApiProperty({ 
    example: '2024-01-15', 
    description: 'Data point label (usually date)' 
  })
  label!: string;

  @ApiProperty({ 
    example: 12500.50, 
    description: 'Data point value' 
  })
  value!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Value currency (optional)' 
  })
  currency?: string;
}

export class AnalyticsChartDto {
  @ApiProperty({ 
    example: 'revenue', 
    description: 'Chart type' 
  })
  type!: string;

  @ApiProperty({ 
    example: 'Revenue Trends', 
    description: 'Chart title' 
  })
  title!: string;

  @ApiProperty({ 
    example: 'line', 
    description: 'Chart visualization type' 
  })
  chartType!: string;

  @ApiProperty({ 
    type: [ChartDataPointDto], 
    description: 'Chart data points' 
  })
  data!: ChartDataPointDto[];
}

export class AnalyticsDashboardDto {
  @ApiProperty({ 
    type: [AnalyticsKpiDto], 
    description: 'Key performance indicators' 
  })
  kpis!: AnalyticsKpiDto[];

  @ApiProperty({ 
    type: [AnalyticsChartDto], 
    description: 'Analytics charts' 
  })
  charts!: AnalyticsChartDto[];

  @ApiProperty({ 
    example: '2024-01-15', 
    description: 'Analytics date' 
  })
  date!: string;

  @ApiProperty({ 
    example: 'monthly', 
    description: 'Analytics period' 
  })
  period!: string;
}
