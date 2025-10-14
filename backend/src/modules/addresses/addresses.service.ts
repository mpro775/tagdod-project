import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Address } from './schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { AppException } from '../../shared/exceptions/app.exception';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(@InjectModel(Address.name) private addressModel: Model<Address>) {}

  /**
   * List all addresses for a user
   */
  async list(userId: string, includeDeleted = false) {
    const query: FilterQuery<Address> = { userId: new Types.ObjectId(userId) };

    if (!includeDeleted) {
      query.deletedAt = null;
    }

    const addresses = await this.addressModel
      .find(query)
      .sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
      .lean();

    return addresses;
  }

  /**
   * Get active addresses only
   */
  async getActiveAddresses(userId: string) {
    return await this.addressModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        deletedAt: null,
      })
      .sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
      .lean();
  }

  /**
   * Get address by ID
   */
  async get(userId: string, id: string) {
    const address = await this.addressModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    if (!address) {
      throw new AppException('Address not found', '404');
    }

    return address;
  }

  /**
   * Create new address
   */
  async create(userId: string, dto: CreateAddressDto) {
    // Check if this will be the first address
    const existingAddresses = await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    // If it's the first address, make it default automatically
    const isDefault = dto.isDefault || existingAddresses === 0;

    // If setting as default, unset all other defaults
    if (isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { $set: { isDefault: false } },
      );
    }

    const address = new this.addressModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      isDefault,
      isActive: true,
      usageCount: 0,
    });

    await address.save();

    this.logger.log(`Address created for user ${userId}: ${address._id}`);

    return address;
  }

  /**
   * Update address
   */
  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.get(userId, id);

    // If setting as default, unset all other defaults
    if (dto.isDefault === true) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId), _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, dto);
    await address.save();

    this.logger.log(`Address updated for user ${userId}: ${id}`);

    return address;
  }

  /**
   * Delete address (soft delete)
   */
  async remove(userId: string, id: string) {
    const address = await this.get(userId, id);

    // Check if it's the only active address
    const activeAddressesCount = await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
      _id: { $ne: id },
    });

    if (activeAddressesCount === 0) {
      throw new AppException('Cannot delete your only address', '400');
    }

    // If it's the default address, make another one default
    if (address.isDefault) {
      const nextAddress = await this.addressModel.findOne({
        userId: new Types.ObjectId(userId),
        deletedAt: null,
        _id: { $ne: id },
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    address.deletedAt = new Date();
    await address.save();

    this.logger.log(`Address deleted for user ${userId}: ${id}`);

    return { deleted: true };
  }

  /**
   * Set address as default
   */
  async setDefault(userId: string, id: string) {
    const address = await this.get(userId, id);

    // Unset all other defaults
    await this.addressModel.updateMany(
      { userId: new Types.ObjectId(userId), _id: { $ne: id } },
      { $set: { isDefault: false } },
    );

    address.isDefault = true;
    await address.save();

    this.logger.log(`Default address set for user ${userId}: ${id}`);

    return address;
  }

  /**
   * Get default address
   */
  async getDefault(userId: string) {
    // Try to find marked default
    let defaultAddress = await this.addressModel.findOne({
      userId: new Types.ObjectId(userId),
      isDefault: true,
      isActive: true,
      deletedAt: null,
    });

    // If no default found, get the most recently used or first created
    if (!defaultAddress) {
      defaultAddress = await this.addressModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
        deletedAt: null,
      }).sort({ lastUsedAt: -1, createdAt: 1 });

      // If found, set it as default
      if (defaultAddress) {
        defaultAddress.isDefault = true;
        await defaultAddress.save();
      }
    }

    return defaultAddress;
  }

  /**
   * Mark address as used (updates lastUsedAt and usageCount)
   */
  async markAsUsed(addressId: string, userId: string): Promise<void> {
    await this.addressModel.updateOne(
      {
        _id: addressId,
        userId: new Types.ObjectId(userId),
      },
      {
        $set: { lastUsedAt: new Date() },
        $inc: { usageCount: 1 },
      },
    );

    this.logger.log(`Address marked as used: ${addressId}`);
  }

  /**
   * Validate that address belongs to user
   */
  async validateAddressOwnership(addressId: string, userId: string): Promise<boolean> {
    const count = await this.addressModel.countDocuments({
      _id: addressId,
      userId: new Types.ObjectId(userId),
      deletedAt: null,
      isActive: true,
    });

    return count > 0;
  }

  /**
   * Get address by ID without user validation (for admin/system use)
   */
  async getAddressById(addressId: string) {
    const address = await this.addressModel.findOne({
      _id: addressId,
      deletedAt: null,
    });

    if (!address) {
      throw new AppException('Address not found', '404');
    }

    return address;
  }

  /**
   * Restore deleted address
   */
  async restore(userId: string, id: string) {
    const address = await this.addressModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!address) {
      throw new AppException('Address not found', '404');
    }

    if (!address.deletedAt) {
      throw new AppException('Address is not deleted', '400');
    }

    address.deletedAt = undefined;
    address.deletedBy = undefined;
    address.isActive = true;

    await address.save();

    this.logger.log(`Address restored for user ${userId}: ${id}`);

    return address;
  }

  /**
   * Get addresses count for user
   */
  async getAddressesCount(userId: string): Promise<number> {
    return await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });
  }
}
