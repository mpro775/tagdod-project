import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole, UserStatus, Currency } from '../src/modules/users/schemas/user.schema';
import { Product, ProductDocument } from '../src/modules/catalog/schemas/product.schema';
import { Category, CategoryDocument } from '../src/modules/categories/schemas/category.schema';
import { Brand, BrandDocument } from '../src/modules/brands/schemas/brand.schema';
import { Attribute, AttributeDocument } from '../src/modules/attributes/schemas/attribute.schema';
import { AttributeValue, AttributeValueDocument } from '../src/modules/attributes/schemas/attribute-value.schema';
import { Variant, VariantDocument } from '../src/modules/catalog/schemas/variant.schema';
import { Cart, CartDocument } from '../src/modules/cart/schemas/cart.schema';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../src/modules/checkout/schemas/order.schema';
import { Address, AddressDocument, AddressType } from '../src/modules/addresses/schemas/address.schema';
import { Media, MediaDocument } from '../src/modules/upload/schemas/media.schema';
import { Favorite, FavoriteDocument } from '../src/modules/favorites/schemas/favorite.schema';
import { Notification, NotificationDocument } from '../src/modules/notifications/schemas/notification.schema';
import { AnalyticsSnapshot, AnalyticsSnapshotDocument } from '../src/modules/analytics/schemas/analytics-snapshot.schema';
import * as bcrypt from 'bcrypt';

interface SeedData {
  users: any[];
  categories: any[];
  brands: any[];
  attributes: any[];
  attributeValues: any[];
  products: any[];
  variants: any[];
  media: any[];
  addresses: any[];
  carts: any[];
  orders: any[];
  favorites: any[];
  notifications: any[];
  analyticsSnapshots: any[];
}

class DatabaseSeeder {
  private app: any;
  private models: {
    User: Model<UserDocument>;
    Product: Model<ProductDocument>;
    Category: Model<CategoryDocument>;
    Brand: Model<BrandDocument>;
    Attribute: Model<AttributeDocument>;
    AttributeValue: Model<AttributeValueDocument>;
    Variant: Model<VariantDocument>;
    Cart: Model<CartDocument>;
    Order: Model<OrderDocument>;
    Address: Model<AddressDocument>;
    Media: Model<MediaDocument>;
    Favorite: Model<FavoriteDocument>;
    Notification: Model<NotificationDocument>;
    AnalyticsSnapshot: Model<AnalyticsSnapshotDocument>;
  };

  constructor() {
    this.models = {} as any;
  }

  async initialize() {
    console.log('🌱 Initializing database seeder...');
    this.app = await NestFactory.createApplicationContext(AppModule);
    
    // Initialize models
    this.models.User = this.app.get(getModelToken(User.name));
    this.models.Product = this.app.get(getModelToken(Product.name));
    this.models.Category = this.app.get(getModelToken(Category.name));
    this.models.Brand = this.app.get(getModelToken(Brand.name));
    this.models.Attribute = this.app.get(getModelToken(Attribute.name));
    this.models.AttributeValue = this.app.get(getModelToken(AttributeValue.name));
    this.models.Variant = this.app.get(getModelToken(Variant.name));
    this.models.Cart = this.app.get(getModelToken(Cart.name));
    this.models.Order = this.app.get(getModelToken(Order.name));
    this.models.Address = this.app.get(getModelToken(Address.name));
    this.models.Media = this.app.get(getModelToken(Media.name));
    this.models.Favorite = this.app.get(getModelToken(Favorite.name));
    this.models.Notification = this.app.get(getModelToken(Notification.name));
    this.models.AnalyticsSnapshot = this.app.get(getModelToken(AnalyticsSnapshot.name));
    
    console.log('✅ Database seeder initialized');
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
  }

  private generateSeedData(): SeedData {
    const passwordHash = bcrypt.hashSync('password123', 10);
    
    return {
      users: [
        {
          phone: '+967123456789',
          firstName: 'أحمد',
          lastName: 'محمد',
          gender: 'male',
          jobTitle: 'مهندس',
          passwordHash,
          isAdmin: true,
          roles: [UserRole.SUPER_ADMIN],
          permissions: ['*'],
          status: UserStatus.ACTIVE,
          preferredCurrency: Currency.USD,
          lastActivityAt: new Date()
        },
        {
          phone: '+967123456790',
          firstName: 'فاطمة',
          lastName: 'علي',
          gender: 'female',
          passwordHash,
          isAdmin: false,
          roles: [UserRole.USER],
          permissions: [],
          status: UserStatus.ACTIVE,
          preferredCurrency: Currency.YER,
          lastActivityAt: new Date()
        },
        {
          phone: '+967123456791',
          firstName: 'محمد',
          lastName: 'حسن',
          gender: 'male',
          jobTitle: 'مهندس كهرباء',
          passwordHash,
          isAdmin: false,
          roles: [UserRole.ENGINEER],
          permissions: ['service:create', 'service:update'],
          status: UserStatus.ACTIVE,
          preferredCurrency: Currency.USD,
          lastActivityAt: new Date()
        }
      ],
      categories: [
        {
          parentId: null,
          name: 'الإلكترونيات',
          nameEn: 'Electronics',
          slug: 'electronics',
          path: '/electronics',
          depth: 0,
          description: 'جميع الأجهزة الإلكترونية',
          descriptionEn: 'All electronic devices',
          order: 1,
          isActive: true,
          showInMenu: true,
          isFeatured: true,
          productsCount: 0,
          childrenCount: 2
        },
        {
          parentId: null,
          name: 'الملابس',
          nameEn: 'Clothing',
          slug: 'clothing',
          path: '/clothing',
          depth: 0,
          description: 'ملابس رجالية ونسائية',
          descriptionEn: 'Men and women clothing',
          order: 2,
          isActive: true,
          showInMenu: true,
          isFeatured: false,
          productsCount: 0,
          childrenCount: 0
        },
        {
          parentId: null,
          name: 'المواد الغذائية',
          nameEn: 'Food',
          slug: 'food',
          path: '/food',
          depth: 0,
          description: 'مواد غذائية ومشروبات',
          descriptionEn: 'Food and beverages',
          order: 3,
          isActive: true,
          showInMenu: true,
          isFeatured: false,
          productsCount: 0,
          childrenCount: 0
        }
      ],
      brands: [
        {
          name: 'سامسونج',
          nameEn: 'Samsung',
          slug: 'samsung',
          description: 'شركة سامسونج للإلكترونيات',
          descriptionEn: 'Samsung Electronics Company',
          isActive: true,
          sortOrder: 1
        },
        {
          name: 'أبل',
          nameEn: 'Apple',
          slug: 'apple',
          description: 'شركة أبل',
          descriptionEn: 'Apple Inc.',
          isActive: true,
          sortOrder: 2
        },
        {
          name: 'نوكيا',
          nameEn: 'Nokia',
          slug: 'nokia',
          description: 'شركة نوكيا',
          descriptionEn: 'Nokia Corporation',
          isActive: true,
          sortOrder: 3
        }
      ],
      attributes: [
        {
          name: 'اللون',
          nameEn: 'Color',
          slug: 'color',
          type: 'text',
          description: 'لون المنتج',
          order: 1,
          isActive: true,
          isFilterable: true,
          isRequired: false,
          showInFilters: true
        },
        {
          name: 'الحجم',
          nameEn: 'Size',
          slug: 'size',
          type: 'text',
          description: 'حجم المنتج',
          order: 2,
          isActive: true,
          isFilterable: true,
          isRequired: false,
          showInFilters: true
        },
        {
          name: 'المادة',
          nameEn: 'Material',
          slug: 'material',
          type: 'text',
          description: 'مادة المنتج',
          order: 3,
          isActive: true,
          isFilterable: true,
          isRequired: false,
          showInFilters: true
        }
      ],
      attributeValues: [
        // Colors
        { attributeId: null, value: 'أحمر', valueEn: 'Red', slug: 'red', hexCode: '#FF0000', order: 1, isActive: true },
        { attributeId: null, value: 'أزرق', valueEn: 'Blue', slug: 'blue', hexCode: '#0000FF', order: 2, isActive: true },
        { attributeId: null, value: 'أخضر', valueEn: 'Green', slug: 'green', hexCode: '#00FF00', order: 3, isActive: true },
        { attributeId: null, value: 'أسود', valueEn: 'Black', slug: 'black', hexCode: '#000000', order: 4, isActive: true },
        { attributeId: null, value: 'أبيض', valueEn: 'White', slug: 'white', hexCode: '#FFFFFF', order: 5, isActive: true },
        
        // Sizes
        { attributeId: null, value: 'صغير', valueEn: 'Small', slug: 'small', order: 1, isActive: true },
        { attributeId: null, value: 'متوسط', valueEn: 'Medium', slug: 'medium', order: 2, isActive: true },
        { attributeId: null, value: 'كبير', valueEn: 'Large', slug: 'large', order: 3, isActive: true },
        { attributeId: null, value: 'كبير جداً', valueEn: 'Extra Large', slug: 'xl', order: 4, isActive: true },
        
        // Materials
        { attributeId: null, value: 'قطن', valueEn: 'Cotton', slug: 'cotton', order: 1, isActive: true },
        { attributeId: null, value: 'بوليستر', valueEn: 'Polyester', slug: 'polyester', order: 2, isActive: true },
        { attributeId: null, value: 'جلد', valueEn: 'Leather', slug: 'leather', order: 3, isActive: true }
      ],
      products: [
        {
          categoryId: null, // Will be set after category creation
          name: 'هاتف سامسونج جالاكسي',
          slug: 'samsung-galaxy-phone',
          description: 'هاتف ذكي من سامسونج بمواصفات عالية',
          brandId: null, // Will be set after brand creation
          adminRating: 4.5,
          tags: ['هاتف', 'ذكي', 'سامسونج'],
          isFeatured: true,
          isNew: true,
          status: 'Active',
          images: [
            { url: 'https://example.com/galaxy1.jpg', sort: 1 },
            { url: 'https://example.com/galaxy2.jpg', sort: 2 }
          ],
          specs: [
            { name: 'الشاشة', value: '6.1 بوصة' },
            { name: 'المعالج', value: 'Exynos 2100' },
            { name: 'الذاكرة', value: '8 جيجابايت' }
          ]
        },
        {
          categoryId: null,
          name: 'قميص قطني',
          slug: 'cotton-shirt',
          description: 'قميص قطني مريح وأنيق',
          brandId: null,
          adminRating: 4.0,
          tags: ['قميص', 'قطن', 'ملابس'],
          isFeatured: false,
          isNew: false,
          status: 'Active',
          images: [
            { url: 'https://example.com/shirt1.jpg', sort: 1 }
          ],
          specs: [
            { name: 'المادة', value: '100% قطن' },
            { name: 'العناية', value: 'غسيل آمن' }
          ]
        }
      ],
      variants: [
        {
          productId: null, // Will be set after product creation
          sku: 'GALAXY-001',
          attributeValues: [
            { attributeId: null, valueId: null, name: 'اللون', value: 'أسود' },
            { attributeId: null, valueId: null, name: 'الحجم', value: 'متوسط' }
          ],
          price: 500000,
          compareAtPrice: 600000,
          costPrice: 400000,
          stock: 50,
          trackInventory: true,
          allowBackorder: false,
          lowStockThreshold: 10,
          weight: 0.2,
          length: 15,
          width: 8,
          height: 1,
          isActive: true,
          isAvailable: true,
          salesCount: 0
        }
      ],
      media: [
        {
          url: 'https://example.com/galaxy1.jpg',
          filename: 'galaxy1.jpg',
          storedFilename: 'galaxy1_123456.jpg',
          name: 'صورة هاتف سامسونج',
          category: 'product',
          type: 'image',
          mimeType: 'image/jpeg',
          size: 1024000,
          width: 800,
          height: 600,
          fileHash: 'abc123def456',
          description: 'صورة رئيسية لهاتف سامسونج',
          tags: ['هاتف', 'سامسونج', 'إلكترونيات'],
          uploadedBy: null, // Will be set after user creation
          usageCount: 1,
          usedIn: ['product'],
          isPublic: true
        }
      ],
      addresses: [
        {
          userId: null, // Will be set after user creation
          label: 'المنزل',
          addressType: AddressType.HOME,
          recipientName: 'أحمد محمد',
          recipientPhone: '+967123456789',
          line1: 'شارع الجمهورية',
          line2: 'مبنى رقم 15',
          city: 'صنعاء',
          region: 'المركز',
          country: 'اليمن',
          postalCode: '12345',
          coords: { lat: 15.3694, lng: 44.1910 },
          notes: 'باب المبنى الرئيسي',
          isDefault: true,
          isActive: true,
          placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
          lastUsedAt: new Date(),
          usageCount: 5
        }
      ],
      carts: [
        {
          userId: null, // Will be set after user creation
          deviceId: 'device_123456',
          status: 'active',
          items: [],
          currency: 'YER',
          accountType: 'retail',
          lastActivityAt: new Date(),
          isAbandoned: false,
          abandonmentEmailsSent: 0,
          isMerged: false,
          metadata: {
            source: 'web',
            campaign: 'summer_sale'
          }
        }
      ],
      orders: [
        {
          orderNumber: 'ORD-2024-001',
          userId: null, // Will be set after user creation
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          statusHistory: [
            {
              status: OrderStatus.PENDING,
              changedAt: new Date(),
              notes: 'تم إنشاء الطلب'
            }
          ],
          deliveryAddress: {
            addressId: null, // Will be set after address creation
            recipientName: 'أحمد محمد',
            recipientPhone: '+967123456789',
            line1: 'شارع الجمهورية',
            line2: 'مبنى رقم 15',
            city: 'صنعاء',
            region: 'المركز',
            country: 'اليمن',
            coords: { lat: 15.3694, lng: 44.1910 },
            notes: 'باب المبنى الرئيسي'
          },
          items: [],
          currency: 'YER',
          subtotal: 500000,
          itemsDiscount: 0,
          shippingCost: 10000,
          tax: 0,
          totalDiscount: 0,
          total: 510000,
          paymentMethod: 'COD',
          customerNotes: 'تسليم في المساء',
          adminNotes: '',
          isRefunded: false,
          refundAmount: 0,
          metadata: {
            source: 'web',
            cartId: null // Will be set after cart creation
          }
        }
      ],
      favorites: [
        {
          userId: null, // Will be set after user creation
          deviceId: 'device_123456',
          productId: null, // Will be set after product creation
          variantId: null, // Will be set after variant creation
          note: 'هاتف ممتاز',
          tags: ['مفضل', 'إلكترونيات'],
          viewsCount: 3,
          lastViewedAt: new Date(),
          isSynced: true,
          syncedAt: new Date()
        }
      ],
      notifications: [
        {
          userId: null, // Will be set after user creation
          title: 'مرحباً بك في تاجدودو',
          message: 'شكراً لانضمامك إلينا! استمتع بتجربة تسوق رائعة.',
          type: 'welcome',
          status: 'unread',
          data: {
            action: 'welcome',
            priority: 'high'
          },
          createdAt: new Date()
        }
      ],
      analyticsSnapshots: [
        {
          date: new Date(),
          period: 'daily',
          users: {
            total: 3,
            active: 3,
            new: 3,
            customers: 2,
            engineers: 1,
            admins: 1,
            verified: 3,
            suspended: 0
          },
          products: {
            total: 2,
            active: 2,
            featured: 1,
            new: 1,
            byCategory: { 'electronics': 1, 'clothing': 1 },
            averageRating: 4.25,
            topRated: [],
            lowStock: []
          },
          orders: {
            total: 1,
            completed: 0,
            pending: 1,
            cancelled: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            byStatus: { 'pending': 1 },
            byPaymentMethod: { 'COD': 1 },
            topProducts: [],
            revenueByCategory: {}
          },
          services: {
            total: 0,
            active: 0,
            completed: 0,
            pending: 0,
            byCategory: {},
            averageRating: 0,
            topEngineers: []
          }
        }
      ]
    };
  }

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');
    
    const seedData = this.generateSeedData();
    
    try {
      // Clear existing data (optional - be careful in production!)
      const clearData = process.argv.includes('--clear');
      if (clearData) {
        console.log('🗑️ Clearing existing data...');
        await this.clearDatabase();
      }
      
      // Seed users first
      console.log('👥 Seeding users...');
      const users = await this.models.User.insertMany(seedData.users);
      console.log(`✅ Created ${users.length} users`);
      
      // Update seed data with user IDs
      const userId = users[0]._id;
      const customerId = users[1]._id;
      const engineerId = users[2]._id;
      
      // Seed categories
      console.log('📁 Seeding categories...');
      const categories = await this.models.Category.insertMany(seedData.categories);
      console.log(`✅ Created ${categories.length} categories`);
      
      // Seed brands
      console.log('🏷️ Seeding brands...');
      const brands = await this.models.Brand.insertMany(seedData.brands);
      console.log(`✅ Created ${brands.length} brands`);
      
      // Seed attributes
      console.log('🔧 Seeding attributes...');
      const attributes = await this.models.Attribute.insertMany(seedData.attributes);
      console.log(`✅ Created ${attributes.length} attributes`);
      
      // Update attribute values with attribute IDs
      const colorAttr = attributes.find(a => a.slug === 'color');
      const sizeAttr = attributes.find(a => a.slug === 'size');
      const materialAttr = attributes.find(a => a.slug === 'material');
      
      const colorValues = seedData.attributeValues.filter(av => ['أحمر', 'أزرق', 'أخضر', 'أسود', 'أبيض'].includes(av.value));
      const sizeValues = seedData.attributeValues.filter(av => ['صغير', 'متوسط', 'كبير', 'كبير جداً'].includes(av.value));
      const materialValues = seedData.attributeValues.filter(av => ['قطن', 'بوليستر', 'جلد'].includes(av.value));
      
      colorValues.forEach(av => av.attributeId = colorAttr._id);
      sizeValues.forEach(av => av.attributeId = sizeAttr._id);
      materialValues.forEach(av => av.attributeId = materialAttr._id);
      
      // Seed attribute values
      console.log('📝 Seeding attribute values...');
      const attributeValues = await this.models.AttributeValue.insertMany(seedData.attributeValues);
      console.log(`✅ Created ${attributeValues.length} attribute values`);
      
      // Update products with category and brand IDs
      seedData.products[0].categoryId = categories[0]._id; // Electronics
      seedData.products[0].brandId = brands[0]._id; // Samsung
      seedData.products[1].categoryId = categories[1]._id; // Clothing
      
      // Seed products
      console.log('📦 Seeding products...');
      const products = await this.models.Product.insertMany(seedData.products);
      console.log(`✅ Created ${products.length} products`);
      
      // Update variants with product ID
      seedData.variants[0].productId = products[0]._id;
      
      // Seed variants
      console.log('🔄 Seeding variants...');
      const variants = await this.models.Variant.insertMany(seedData.variants);
      console.log(`✅ Created ${variants.length} variants`);
      
      // Update media with user ID
      seedData.media[0].uploadedBy = userId;
      
      // Seed media
      console.log('🖼️ Seeding media...');
      const media = await this.models.Media.insertMany(seedData.media);
      console.log(`✅ Created ${media.length} media files`);
      
      // Update addresses with user ID
      seedData.addresses[0].userId = userId;
      
      // Seed addresses
      console.log('📍 Seeding addresses...');
      const addresses = await this.models.Address.insertMany(seedData.addresses);
      console.log(`✅ Created ${addresses.length} addresses`);
      
      // Update carts with user ID
      seedData.carts[0].userId = userId;
      
      // Seed carts
      console.log('🛒 Seeding carts...');
      const carts = await this.models.Cart.insertMany(seedData.carts);
      console.log(`✅ Created ${carts.length} carts`);
      
      // Update orders with user ID and address ID
      seedData.orders[0].userId = userId;
      seedData.orders[0].deliveryAddress.addressId = addresses[0]._id;
      seedData.orders[0].metadata.cartId = carts[0]._id;
      
      // Seed orders
      console.log('📋 Seeding orders...');
      const orders = await this.models.Order.insertMany(seedData.orders);
      console.log(`✅ Created ${orders.length} orders`);
      
      // Update favorites with user and product IDs
      seedData.favorites[0].userId = userId;
      seedData.favorites[0].productId = products[0]._id;
      seedData.favorites[0].variantId = variants[0]._id;
      
      // Seed favorites
      console.log('❤️ Seeding favorites...');
      const favorites = await this.models.Favorite.insertMany(seedData.favorites);
      console.log(`✅ Created ${favorites.length} favorites`);
      
      // Update notifications with user ID
      seedData.notifications[0].userId = userId;
      
      // Seed notifications
      console.log('🔔 Seeding notifications...');
      const notifications = await this.models.Notification.insertMany(seedData.notifications);
      console.log(`✅ Created ${notifications.length} notifications`);
      
      // Seed analytics snapshots
      console.log('📊 Seeding analytics snapshots...');
      const analyticsSnapshots = await this.models.AnalyticsSnapshot.insertMany(seedData.analyticsSnapshots);
      console.log(`✅ Created ${analyticsSnapshots.length} analytics snapshots`);
      
      console.log('🎉 Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`👥 Users: ${users.length}`);
      console.log(`📁 Categories: ${categories.length}`);
      console.log(`🏷️ Brands: ${brands.length}`);
      console.log(`🔧 Attributes: ${attributes.length}`);
      console.log(`📝 Attribute Values: ${attributeValues.length}`);
      console.log(`📦 Products: ${products.length}`);
      console.log(`🔄 Variants: ${variants.length}`);
      console.log(`🖼️ Media: ${media.length}`);
      console.log(`📍 Addresses: ${addresses.length}`);
      console.log(`🛒 Carts: ${carts.length}`);
      console.log(`📋 Orders: ${orders.length}`);
      console.log(`❤️ Favorites: ${favorites.length}`);
      console.log(`🔔 Notifications: ${notifications.length}`);
      console.log(`📊 Analytics Snapshots: ${analyticsSnapshots.length}`);
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async clearDatabase() {
    console.log('🗑️ Clearing database...');
    
    const collections = [
      'analyticsnapshots', 'notifications', 'favorites', 'orders', 'carts',
      'addresses', 'media', 'variants', 'products', 'attributevalues',
      'attributes', 'brands', 'categories', 'users'
    ];
    
    for (const collectionName of collections) {
      try {
        await this.models[collectionName.charAt(0).toUpperCase() + collectionName.slice(1)].deleteMany({});
        console.log(`✅ Cleared ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${collectionName}: ${error.message}`);
      }
    }
  }

  async listData() {
    console.log('📊 Current database data:');
    
    const collections = [
      { name: 'users', model: this.models.User },
      { name: 'categories', model: this.models.Category },
      { name: 'brands', model: this.models.Brand },
      { name: 'attributes', model: this.models.Attribute },
      { name: 'attributevalues', model: this.models.AttributeValue },
      { name: 'products', model: this.models.Product },
      { name: 'variants', model: this.models.Variant },
      { name: 'media', model: this.models.Media },
      { name: 'addresses', model: this.models.Address },
      { name: 'carts', model: this.models.Cart },
      { name: 'orders', model: this.models.Order },
      { name: 'favorites', model: this.models.Favorite },
      { name: 'notifications', model: this.models.Notification },
      { name: 'analyticsnapshots', model: this.models.AnalyticsSnapshot }
    ];
    
    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`📁 ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`⚠️ Could not count ${collection.name}: ${error.message}`);
      }
    }
  }
}

async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.initialize();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'seed':
        await seeder.seedDatabase();
        break;
      case 'clear':
        await seeder.clearDatabase();
        break;
      case 'list':
        await seeder.listData();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run db:seed seed        - Seed the database');
        console.log('  npm run db:seed clear       - Clear the database');
        console.log('  npm run db:seed list        - List current data counts');
        console.log('  npm run db:seed seed --clear - Clear and seed database');
        break;
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

if (require.main === module) {
  main();
}
