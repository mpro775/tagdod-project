import { ApiProperty } from '@nestjs/swagger';

// ==================== Authentication Schemas ====================

export class SendOtpDto {
  @ApiProperty({ 
    example: '+966501234567', 
    description: 'Phone number with country code' 
  })
  phone: string;

  @ApiProperty({ 
    example: 'register', 
    enum: ['register', 'reset'], 
    description: 'OTP context' 
  })
  context?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ 
    example: '+966501234567', 
    description: 'Phone number with country code' 
  })
  phone: string;

  @ApiProperty({ 
    example: '123456', 
    description: 'OTP verification code' 
  })
  code: string;

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
    example: 'engineer', 
    enum: ['engineer', 'wholesale'], 
    description: 'Capability request type' 
  })
  capabilityRequest?: string;

  @ApiProperty({ 
    example: 'مهندس كهرباء', 
    description: 'Job title (required for engineers)' 
  })
  jobTitle?: string;

  @ApiProperty({ 
    example: 'device123', 
    description: 'Device ID for guest cart sync' 
  })
  deviceId?: string;
}

export class SetPasswordDto {
  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'New password' 
  })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    example: '+966501234567', 
    description: 'Phone number' 
  })
  phone: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    example: '+966501234567', 
    description: 'Phone number' 
  })
  phone: string;

  @ApiProperty({ 
    example: '123456', 
    description: 'OTP verification code' 
  })
  code: string;

  @ApiProperty({ 
    example: 'NewSecurePassword123!', 
    description: 'New password' 
  })
  newPassword: string;
}

export class UpdatePreferredCurrencyDto {
  @ApiProperty({ 
    example: 'USD', 
    enum: ['USD', 'SAR', 'AED', 'EUR'], 
    description: 'Preferred currency' 
  })
  currency: string;
}

// ==================== Product Schemas ====================

export class CreateProductDto {
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
    description: 'Product base price' 
  })
  price: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Product currency' 
  })
  currency: string;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg'], 
    type: [String], 
    description: 'Product images URLs' 
  })
  images: string[];

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439015', 
    description: 'Category ID' 
  })
  categoryId: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439016', 
    description: 'Brand ID' 
  })
  brandId: string;

  @ApiProperty({ 
    example: true, 
    description: 'Whether product is featured' 
  })
  isFeatured?: boolean;

  @ApiProperty({ 
    example: false, 
    description: 'Whether product is new' 
  })
  isNew?: boolean;
}

export class UpdateProductDto {
  @ApiProperty({ 
    example: 'Solar Panel 300W Updated', 
    description: 'Product name' 
  })
  name?: string;

  @ApiProperty({ 
    example: 'Updated description', 
    description: 'Product description' 
  })
  description?: string;

  @ApiProperty({ 
    example: 349.99, 
    description: 'Product price' 
  })
  price?: number;

  @ApiProperty({ 
    example: true, 
    description: 'Whether product is featured' 
  })
  isFeatured?: boolean;

  @ApiProperty({ 
    example: false, 
    description: 'Whether product is new' 
  })
  isNew?: boolean;
}

// ==================== Cart Schemas ====================

export class AddItemDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439014', 
    description: 'Product variant ID' 
  })
  variantId: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Item quantity' 
  })
  qty: number;
}

export class UpdateItemDto {
  @ApiProperty({ 
    example: 3, 
    description: 'New item quantity' 
  })
  qty: number;
}

export class DeviceDto {
  @ApiProperty({ 
    example: 'device123', 
    description: 'Device ID for guest cart' 
  })
  deviceId: string;
}

export class PreviewDto {
  @ApiProperty({ 
    example: 'USD', 
    description: 'Currency for preview' 
  })
  currency: string;
}

// ==================== Checkout Schemas ====================

export class CheckoutPreviewDto {
  @ApiProperty({ 
    example: 'USD', 
    description: 'Currency for checkout' 
  })
  currency: string;
}

export class CheckoutConfirmDto {
  @ApiProperty({ 
    example: 'USD', 
    description: 'Currency for checkout' 
  })
  currency: string;

  @ApiProperty({ 
    example: 'card', 
    enum: ['card', 'bank_transfer', 'cash_on_delivery'], 
    description: 'Payment method' 
  })
  paymentMethod: string;

  @ApiProperty({ 
    example: 'stripe', 
    enum: ['stripe', 'paypal', 'moyasar'], 
    description: 'Payment provider' 
  })
  paymentProvider: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439017', 
    description: 'Delivery address ID' 
  })
  deliveryAddressId: string;
}

export class WebhookDto {
  @ApiProperty({ 
    example: 'pi_1234567890', 
    description: 'Payment intent ID' 
  })
  intentId: string;

  @ApiProperty({ 
    example: 'succeeded', 
    enum: ['succeeded', 'failed', 'pending'], 
    description: 'Payment status' 
  })
  status: string;

  @ApiProperty({ 
    example: 68748, 
    description: 'Payment amount in cents' 
  })
  amount: number;

  @ApiProperty({ 
    example: 'webhook_signature', 
    description: 'Webhook signature' 
  })
  signature: string;
}

// ==================== Analytics Schemas ====================

export class AnalyticsQueryDto {
  @ApiProperty({ 
    example: 'monthly', 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    description: 'Analytics period' 
  })
  period?: string;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00Z', 
    description: 'Start date (ISO format)' 
  })
  startDate?: string;

  @ApiProperty({ 
    example: '2024-01-31T23:59:59Z', 
    description: 'End date (ISO format)' 
  })
  endDate?: string;

  @ApiProperty({ 
    example: true, 
    description: 'Compare with previous period' 
  })
  compareWithPrevious?: boolean;
}

export class ReportGenerationDto {
  @ApiProperty({ 
    example: 'monthly', 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    description: 'Report type' 
  })
  reportType: string;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00Z', 
    description: 'Report start date' 
  })
  startDate?: string;

  @ApiProperty({ 
    example: '2024-01-31T23:59:59Z', 
    description: 'Report end date' 
  })
  endDate?: string;

  @ApiProperty({ 
    example: ['pdf', 'xlsx'], 
    type: [String], 
    description: 'Export formats' 
  })
  formats?: string[];
}

export class CreateReportScheduleDto {
  @ApiProperty({ 
    example: 'monthly', 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    description: 'Schedule frequency' 
  })
  frequency: string;

  @ApiProperty({ 
    example: 'monthly', 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    description: 'Report type' 
  })
  reportType: string;

  @ApiProperty({ 
    example: 'admin@example.com', 
    description: 'Email for report delivery' 
  })
  email: string;

  @ApiProperty({ 
    example: ['pdf', 'xlsx'], 
    type: [String], 
    description: 'Export formats' 
  })
  formats: string[];
}

// ==================== Address Schemas ====================

export class CreateAddressDto {
  @ApiProperty({ 
    example: 'المنزل', 
    description: 'Address label' 
  })
  label: string;

  @ApiProperty({ 
    example: 'شارع الملك فهد', 
    description: 'Street address' 
  })
  street: string;

  @ApiProperty({ 
    example: 'الرياض', 
    description: 'City' 
  })
  city: string;

  @ApiProperty({ 
    example: '12345', 
    description: 'Postal code' 
  })
  postalCode: string;

  @ApiProperty({ 
    example: 'SA', 
    description: 'Country code' 
  })
  country: string;

  @ApiProperty({ 
    example: '24.7136', 
    description: 'Latitude' 
  })
  latitude?: number;

  @ApiProperty({ 
    example: '46.6753', 
    description: 'Longitude' 
  })
  longitude?: number;

  @ApiProperty({ 
    example: true, 
    description: 'Whether this is the default address' 
  })
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiProperty({ 
    example: 'العمل', 
    description: 'Address label' 
  })
  label?: string;

  @ApiProperty({ 
    example: 'شارع العليا', 
    description: 'Street address' 
  })
  street?: string;

  @ApiProperty({ 
    example: 'الرياض', 
    description: 'City' 
  })
  city?: string;

  @ApiProperty({ 
    example: '12345', 
    description: 'Postal code' 
  })
  postalCode?: string;

  @ApiProperty({ 
    example: true, 
    description: 'Whether this is the default address' 
  })
  isDefault?: boolean;
}

// ==================== Notification Schemas ====================

export class CreateNotificationDto {
  @ApiProperty({ 
    example: 'order_update', 
    enum: ['order_update', 'payment_success', 'delivery_update', 'promotion'], 
    description: 'Notification type' 
  })
  type: string;

  @ApiProperty({ 
    example: 'تم تحديث حالة طلبك', 
    description: 'Notification title' 
  })
  title: string;

  @ApiProperty({ 
    example: 'تم تأكيد طلبك رقم ORD-2024-001', 
    description: 'Notification message' 
  })
  message: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'User ID (optional for broadcast)' 
  })
  userId?: string;

  @ApiProperty({ 
    example: { orderId: '507f1f77bcf86cd799439011' }, 
    description: 'Additional data' 
  })
  data?: Record<string, any>;
}

export class MarkNotificationReadDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Notification ID' 
  })
  notificationId: string;
}

// ==================== Support Schemas ====================

export class CreateTicketDto {
  @ApiProperty({ 
    example: 'technical', 
    enum: ['technical', 'billing', 'general', 'complaint'], 
    description: 'Ticket category' 
  })
  category: string;

  @ApiProperty({ 
    example: 'مشكلة في المنتج', 
    description: 'Ticket subject' 
  })
  subject: string;

  @ApiProperty({ 
    example: 'لا يعمل المنتج بشكل صحيح', 
    description: 'Ticket description' 
  })
  description: string;

  @ApiProperty({ 
    example: 'high', 
    enum: ['low', 'medium', 'high', 'urgent'], 
    description: 'Ticket priority' 
  })
  priority: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'Related order ID (optional)' 
  })
  orderId?: string;
}

export class UpdateTicketDto {
  @ApiProperty({ 
    example: 'open', 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    description: 'Ticket status' 
  })
  status?: string;

  @ApiProperty({ 
    example: 'تم حل المشكلة', 
    description: 'Resolution notes' 
  })
  resolution?: string;
}

// ==================== Service Request Schemas ====================

export class CreateServiceRequestDto {
  @ApiProperty({ 
    example: 'installation', 
    enum: ['installation', 'maintenance', 'repair', 'consultation'], 
    description: 'Service type' 
  })
  type: string;

  @ApiProperty({ 
    example: 'تركيب ألواح شمسية', 
    description: 'Service description' 
  })
  description: string;

  @ApiProperty({ 
    example: '2024-01-20T10:00:00Z', 
    description: 'Preferred appointment date' 
  })
  preferredDate: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439017', 
    description: 'Service address ID' 
  })
  addressId: string;

  @ApiProperty({ 
    example: 'high', 
    enum: ['low', 'medium', 'high', 'urgent'], 
    description: 'Service priority' 
  })
  priority: string;
}

export class UpdateServiceRequestDto {
  @ApiProperty({ 
    example: 'scheduled', 
    enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'], 
    description: 'Service status' 
  })
  status?: string;

  @ApiProperty({ 
    example: '2024-01-20T10:00:00Z', 
    description: 'Scheduled date' 
  })
  scheduledDate?: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439018', 
    description: 'Assigned engineer ID' 
  })
  engineerId?: string;
}
