import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';
import { Product, ProductDocument } from '../src/modules/products/schemas/product.schema';
import { Category, CategoryDocument } from '../src/modules/categories/schemas/category.schema';
import { Brand, BrandDocument } from '../src/modules/brands/schemas/brand.schema';
import { Attribute, AttributeDocument } from '../src/modules/attributes/schemas/attribute.schema';
import { AttributeValue, AttributeValueDocument } from '../src/modules/attributes/schemas/attribute-value.schema';
import { Variant, VariantDocument } from '../src/modules/products/schemas/variant.schema';
import { Cart, CartDocument } from '../src/modules/cart/schemas/cart.schema';
import { Order, OrderDocument } from '../src/modules/checkout/schemas/order.schema';
import { Address, AddressDocument } from '../src/modules/addresses/schemas/address.schema';
import { Media, MediaDocument } from '../src/modules/upload/schemas/media.schema';
import { Favorite, FavoriteDocument } from '../src/modules/favorites/schemas/favorite.schema';
import { Notification, NotificationDocument } from '../src/modules/notifications/schemas/notification.schema';
import { AnalyticsSnapshot, AnalyticsSnapshotDocument } from '../src/modules/analytics/schemas/analytics-snapshot.schema';
import { Capabilities, CapabilitiesDocument } from '../src/modules/capabilities/schemas/capabilities.schema';

interface Migration {
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class DatabaseMigrator {
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
    Capabilities: Model<CapabilitiesDocument>;
  };

  constructor() {
    this.models = {} as any;
  }

  async initialize() {
    console.log('🚀 Initializing database migrator...');
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
    this.models.Capabilities = this.app.get(getModelToken(Capabilities.name));
    
    console.log('✅ Database migrator initialized');
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
  }

  private getMigrations(): Migration[] {
    return [
      {
        name: 'create_initial_indexes',
        up: async () => {
          console.log('📊 Creating initial indexes...');
          
          // User indexes
          await this.models.User.collection.createIndex({ phone: 1 }, { unique: true });
          await this.models.User.collection.createIndex({ isAdmin: 1 });
          await this.models.User.collection.createIndex({ createdAt: -1 });
          await this.models.User.collection.createIndex({ phone: 1, isAdmin: 1 });
          await this.models.User.collection.createIndex({ status: 1 });
          await this.models.User.collection.createIndex({ deletedAt: 1 });
          await this.models.User.collection.createIndex({ roles: 1 });
          await this.models.User.collection.createIndex({ status: 1, deletedAt: 1, createdAt: -1 });
          await this.models.User.collection.createIndex({ lastActivityAt: -1 });
          await this.models.User.collection.createIndex({ status: 1, lastActivityAt: -1 });
          
          // Product indexes
          await this.models.Product.collection.createIndex({ name: 'text', description: 'text', tags: 'text' });
          await this.models.Product.collection.createIndex({ categoryId: 1, status: 1 });
          await this.models.Product.collection.createIndex({ isFeatured: 1, isNew: 1, adminRating: -1 });
          
          // Category indexes
          await this.models.Category.collection.createIndex({ parentId: 1, order: 1 });
          await this.models.Category.collection.createIndex({ path: 1 });
          await this.models.Category.collection.createIndex({ slug: 1 }, { unique: true });
          await this.models.Category.collection.createIndex({ isActive: 1, showInMenu: 1 });
          await this.models.Category.collection.createIndex({ isFeatured: 1 });
          await this.models.Category.collection.createIndex({ deletedAt: 1 });
          await this.models.Category.collection.createIndex({ parentId: 1, isActive: 1, order: 1 });
          await this.models.Category.collection.createIndex({ name: 'text', description: 'text' });
          
          // Cart indexes
          await this.models.Cart.collection.createIndex({ userId: 1, status: 1, updatedAt: -1 });
          await this.models.Cart.collection.createIndex({ deviceId: 1, status: 1, updatedAt: -1 });
          await this.models.Cart.collection.createIndex({ status: 1, lastActivityAt: -1 });
          await this.models.Cart.collection.createIndex({ isAbandoned: 1, abandonmentEmailsSent: 1 });
          await this.models.Cart.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
          await this.models.Cart.collection.createIndex({ createdAt: -1 });
          await this.models.Cart.collection.createIndex({ updatedAt: -1 });
          await this.models.Cart.collection.createIndex({ convertedToOrderId: 1 }, { sparse: true });
          
          // Order indexes
          await this.models.Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
          await this.models.Order.collection.createIndex({ status: 1, createdAt: -1 });
          await this.models.Order.collection.createIndex({ userId: 1, status: 1, createdAt: -1 });
          await this.models.Order.collection.createIndex({ paymentIntentId: 1 }, { sparse: true, unique: true });
          await this.models.Order.collection.createIndex({ createdAt: -1 });
          
          // Address indexes
          await this.models.Address.collection.createIndex({ userId: 1, isDefault: 1 });
          await this.models.Address.collection.createIndex({ userId: 1, deletedAt: 1 });
          await this.models.Address.collection.createIndex({ userId: 1, isActive: 1, createdAt: -1 });
          await this.models.Address.collection.createIndex({ userId: 1, addressType: 1 });
          await this.models.Address.collection.createIndex({ city: 1, region: 1 });
          await this.models.Address.collection.createIndex({ coords: '2dsphere' }, { sparse: true });
          await this.models.Address.collection.createIndex({ placeId: 1 }, { sparse: true });
          await this.models.Address.collection.createIndex({ lastUsedAt: -1 });
          
          console.log('✅ Initial indexes created');
        },
        down: async () => {
          console.log('🗑️ Dropping initial indexes...');
          // Note: In production, you might want to be more selective about which indexes to drop
          console.log('⚠️ Manual index cleanup required');
        }
      },
      {
        name: 'add_sparse_indexes',
        up: async () => {
          console.log('📊 Adding sparse indexes...');
          
          // Add sparse indexes for optional fields
          await this.models.Media.collection.createIndex({ fileHash: 1 }, { sparse: true });
          await this.models.Order.collection.createIndex({ trackingNumber: 1 }, { sparse: true });
          await this.models.Order.collection.createIndex({ paidAt: 1 }, { sparse: true });
          await this.models.Order.collection.createIndex({ deliveredAt: 1 }, { sparse: true });
          await this.models.Order.collection.createIndex({ cancelledAt: 1 }, { sparse: true });
          await this.models.Notification.collection.createIndex({ readAt: 1 }, { sparse: true });
          await this.models.SupportTicket.collection.createIndex({ closedAt: 1 }, { sparse: true });
          
          console.log('✅ Sparse indexes added');
        },
        down: async () => {
          console.log('🗑️ Dropping sparse indexes...');
          console.log('⚠️ Manual sparse index cleanup required');
        }
      },
      {
        name: 'add_partial_indexes',
        up: async () => {
          console.log('📊 Adding partial indexes...');
          
          // Add partial indexes for conditional uniqueness
          await this.models.Favorite.collection.createIndex(
            { userId: 1, productId: 1, variantId: 1 },
            { 
              unique: true,
              partialFilterExpression: { userId: { $exists: true } }
            }
          );
          
          await this.models.Favorite.collection.createIndex(
            { deviceId: 1, productId: 1, variantId: 1 },
            { 
              unique: true,
              partialFilterExpression: { deviceId: { $exists: true } }
            }
          );
          
          console.log('✅ Partial indexes added');
        },
        down: async () => {
          console.log('🗑️ Dropping partial indexes...');
          console.log('⚠️ Manual partial index cleanup required');
        }
      },
      {
        name: 'add_ttl_indexes',
        up: async () => {
          console.log('📊 Adding TTL indexes...');
          
          // Add TTL indexes for automatic cleanup
          await this.models.Cart.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
          await this.models.Notification.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
          
          console.log('✅ TTL indexes added');
        },
        down: async () => {
          console.log('🗑️ Dropping TTL indexes...');
          console.log('⚠️ Manual TTL index cleanup required');
        }
      },
      {
        name: 'rename_wholesale_to_merchant',
        up: async () => {
          console.log('🔄 Renaming wholesale fields to merchant...');
          
          // 1. Update Users collection
          console.log('📝 Updating Users collection...');
          const userResult = await this.models.User.collection.updateMany(
            {},
            {
              $rename: {
                'wholesale_capable': 'merchant_capable',
                'wholesale_status': 'merchant_status',
                'wholesale_discount_percent': 'merchant_discount_percent',
              }
            }
          );
          console.log(`✅ Updated ${userResult.modifiedCount} users`);
          
          // 2. Update Capabilities collection
          console.log('📝 Updating Capabilities collection...');
          const capsResult = await this.models.Capabilities.collection.updateMany(
            {},
            {
              $rename: {
                'wholesale_capable': 'merchant_capable',
                'wholesale_status': 'merchant_status',
                'wholesale_discount_percent': 'merchant_discount_percent',
              }
            }
          );
          console.log(`✅ Updated ${capsResult.modifiedCount} capabilities`);
          
          // 3. Update accountType in Carts collection
          console.log('📝 Updating accountType in Carts collection...');
          const cartResult = await this.models.Cart.collection.updateMany(
            { accountType: 'wholesale' },
            {
              $set: {
                accountType: 'merchant'
              }
            }
          );
          console.log(`✅ Updated ${cartResult.modifiedCount} carts`);
          
          // 4. Update accountType in Orders collection
          console.log('📝 Updating accountType in Orders collection...');
          const orderResult = await this.models.Order.collection.updateMany(
            { accountType: 'wholesale' },
            {
              $set: {
                accountType: 'merchant'
              }
            }
          );
          console.log(`✅ Updated ${orderResult.modifiedCount} orders`);
          
          console.log('✅ Migration completed: rename_wholesale_to_merchant');
        },
        down: async () => {
          console.log('🔄 Rolling back: renaming merchant fields back to wholesale...');
          
          // 1. Rollback Users collection
          console.log('📝 Rolling back Users collection...');
          const userResult = await this.models.User.collection.updateMany(
            {},
            {
              $rename: {
                'merchant_capable': 'wholesale_capable',
                'merchant_status': 'wholesale_status',
                'merchant_discount_percent': 'wholesale_discount_percent',
              }
            }
          );
          console.log(`✅ Rolled back ${userResult.modifiedCount} users`);
          
          // 2. Rollback Capabilities collection
          console.log('📝 Rolling back Capabilities collection...');
          const capsResult = await this.models.Capabilities.collection.updateMany(
            {},
            {
              $rename: {
                'merchant_capable': 'wholesale_capable',
                'merchant_status': 'wholesale_status',
                'merchant_discount_percent': 'wholesale_discount_percent',
              }
            }
          );
          console.log(`✅ Rolled back ${capsResult.modifiedCount} capabilities`);
          
          // 3. Rollback accountType in Carts collection
          console.log('📝 Rolling back accountType in Carts collection...');
          const cartResult = await this.models.Cart.collection.updateMany(
            { accountType: 'merchant' },
            {
              $set: {
                accountType: 'wholesale'
              }
            }
          );
          console.log(`✅ Rolled back ${cartResult.modifiedCount} carts`);
          
          // 4. Rollback accountType in Orders collection
          console.log('📝 Rolling back accountType in Orders collection...');
          const orderResult = await this.models.Order.collection.updateMany(
            { accountType: 'merchant' },
            {
              $set: {
                accountType: 'wholesale'
              }
            }
          );
          console.log(`✅ Rolled back ${orderResult.modifiedCount} orders`);
          
          console.log('✅ Rollback completed: rename_wholesale_to_merchant');
        }
      }
    ];
  }

  async runMigrations() {
    const migrations = this.getMigrations();
    
    for (const migration of migrations) {
      try {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.up();
        console.log(`✅ Migration completed: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${migration.name}`, error);
        throw error;
      }
    }
  }

  async rollbackMigration(migrationName: string) {
    const migrations = this.getMigrations();
    const migration = migrations.find(m => m.name === migrationName);
    
    if (!migration) {
      throw new Error(`Migration not found: ${migrationName}`);
    }
    
    try {
      console.log(`🔄 Rolling back migration: ${migration.name}`);
      await migration.down();
      console.log(`✅ Rollback completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${migration.name}`, error);
      throw error;
    }
  }

  async listIndexes() {
    console.log('📊 Current database indexes:');
    
    const collections = [
      'users', 'products', 'categories', 'brands', 'attributes', 'attributevalues',
      'variants', 'carts', 'orders', 'addresses', 'media', 'favorites',
      'notifications', 'analyticsnapshots'
    ];
    
    for (const collectionName of collections) {
      try {
        const collection = this.app.get('DatabaseConnection').db.collection(collectionName);
        const indexes = await collection.indexes();
        
        console.log(`\n📁 Collection: ${collectionName}`);
        indexes.forEach((index: any, i: number) => {
          console.log(`  ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
          if (index.unique) console.log('     - Unique');
          if (index.sparse) console.log('     - Sparse');
          if (index.partialFilterExpression) console.log('     - Partial');
          if (index.expireAfterSeconds !== undefined) console.log(`     - TTL: ${index.expireAfterSeconds}s`);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️ Could not list indexes for ${collectionName}: ${errorMessage}`);
      }
    }
  }
}

async function main() {
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.initialize();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'migrate':
        await migrator.runMigrations();
        break;
      case 'rollback':
        const migrationName = process.argv[3];
        if (!migrationName) {
          throw new Error('Migration name required for rollback');
        }
        await migrator.rollbackMigration(migrationName);
        break;
      case 'list':
        await migrator.listIndexes();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run db:migrate migrate    - Run all migrations');
        console.log('  npm run db:migrate rollback <name> - Rollback specific migration');
        console.log('  npm run db:migrate list       - List current indexes');
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

if (require.main === module) {
  main();
}
