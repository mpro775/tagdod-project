import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Address } from './schemas/address.schema';
import { User } from '../users/schemas/user.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { 
  AddressNotFoundException,
  AddressException,
  ErrorCode 
} from '../../shared/exceptions';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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
      throw new AddressNotFoundException({ addressId: id });
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
      throw new AddressNotFoundException({ addressId });
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
      throw new AddressNotFoundException({ addressId: id });
    }

    if (!address.deletedAt) {
      throw new AddressException(ErrorCode.ADDRESS_INVALID_DATA, { addressId: id, reason: 'not_deleted' });
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

  // =====================================================
  // ADMIN METHODS
  // =====================================================

  /**
   * Get all addresses with filters and pagination (Admin)
   */
  async adminList(filters: {
    userId?: string;
    city?: string;
    label?: string;
    isDefault?: boolean;
    isActive?: boolean;
    includeDeleted?: boolean;
    deletedOnly?: boolean;
    search?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      userId,
      city,
      label,
      isDefault,
      isActive,
      includeDeleted,
      deletedOnly,
      search,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: FilterQuery<Address> = {};

    // Filters
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (label) {
      query.label = new RegExp(label, 'i');
    }

    if (isDefault !== undefined) {
      query.isDefault = isDefault;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (deletedOnly) {
      query.deletedAt = { $ne: null };
    } else if (includeDeleted !== true) {
      query.deletedAt = null;
    }

    // Search in text fields
    const buildRegex = (value: string) => {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(escaped, 'i');
    };

    let userIdsMatchingSearch: Types.ObjectId[] = [];

    if (search?.trim()) {
      const searchRegex = buildRegex(search.trim());
      const numericSearch = search.replace(/\D/g, '');

      const userSearchConditions: FilterQuery<User>[] = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { name: searchRegex },
      ];

      if (numericSearch) {
        userSearchConditions.push({ phone: new RegExp(numericSearch, 'i') });
      } else {
        userSearchConditions.push({ phone: searchRegex });
      }

      const matchingUsers = await this.userModel
        .find({ $or: userSearchConditions })
        .select('_id')
        .limit(200)
        .lean();

      if (matchingUsers.length) {
        userIdsMatchingSearch = matchingUsers.map((user) => new Types.ObjectId(user._id));
      }

      const orConditions: FilterQuery<Address>[] = [
        { label: searchRegex },
        { line1: searchRegex },
        { city: searchRegex },
        { notes: searchRegex },
      ];

      if (userIdsMatchingSearch.length) {
        orConditions.push({ userId: { $in: userIdsMatchingSearch } });
      }

      query.$or = orConditions;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [addresses, total] = await Promise.all([
      this.addressModel
        .find(query)
        .populate('userId', 'name firstName lastName phone email isActive createdAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.addressModel.countDocuments(query),
    ]);

    const enhancedAddresses = addresses.map((address) => {
      const user: any = address.userId;

      if (user && typeof user === 'object') {
        const fullName =
          user.name ||
          [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
          user.phone ||
          '';

        return {
          ...address,
          userId: {
            ...user,
            name: fullName,
          },
        };
      }

      return address;
    });

    return {
      data: enhancedAddresses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get comprehensive statistics (Admin)
   */
  async getStats() {
    const [
      totalAddresses,
      totalActiveAddresses,
      totalDeletedAddresses,
      totalUsers,
      avgPerUser,
    ] = await Promise.all([
      // Total addresses (including deleted)
      this.addressModel.countDocuments(),

      // Active addresses
      this.addressModel.countDocuments({ deletedAt: null, isActive: true }),

      // Deleted addresses
      this.addressModel.countDocuments({ deletedAt: { $ne: null } }),

      // Users with addresses
      this.addressModel.distinct('userId', { deletedAt: null }),

      // Average addresses per user
      this.addressModel
        .aggregate([
          { $match: { deletedAt: null } },
          {
            $group: {
              _id: '$userId',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              avgAddresses: { $avg: '$count' },
            },
          },
        ])
        .then((result) => result[0]?.avgAddresses || 0),
    ]);

    return {
      totalAddresses,
      totalActiveAddresses,
      totalDeletedAddresses,
      totalUsers: totalUsers.length,
      averagePerUser: Number(avgPerUser.toFixed(2)),
    };
  }

  /**
   * Get top cities by address count (Admin)
   */
  async getTopCities(limit = 10) {
    const cities = await this.addressModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          defaultCount: {
            $sum: { $cond: [{ $eq: ['$isDefault', true] }, 1, 0] },
          },
          totalUsage: { $sum: '$usageCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id',
          count: 1,
          activeCount: 1,
          defaultCount: 1,
          totalUsage: 1,
        },
      },
    ]);

    // Calculate total for percentage
    const total = await this.addressModel.countDocuments({ deletedAt: null });

    return cities.map((city) => ({
      ...city,
      percentage:
        total > 0 ? Number(((city.count / total) * 100).toFixed(2)) : 0,
    }));
  }

  /**
   * Get most used addresses (Admin)
   */
  async getMostUsedAddresses(limit = 10) {
    return await this.addressModel
      .find({ deletedAt: null, usageCount: { $gt: 0 } })
      .populate('userId', 'name phone')
      .sort({ usageCount: -1 })
      .limit(limit)
      .select('label line1 city usageCount lastUsedAt userId')
      .lean();
  }

  /**
   * Get recently used addresses (Admin)
   */
  async getRecentlyUsedAddresses(limit = 20) {
    return await this.addressModel
      .find({ deletedAt: null, lastUsedAt: { $exists: true } })
      .populate('userId', 'name phone')
      .sort({ lastUsedAt: -1 })
      .limit(limit)
      .select('label line1 city usageCount lastUsedAt userId')
      .lean();
  }

  /**
   * Get never used addresses (Admin)
   */
  async getNeverUsedAddresses(limit = 20) {
    return await this.addressModel
      .find({
        deletedAt: null,
        $or: [{ usageCount: 0 }, { usageCount: { $exists: false } }],
      })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('label line1 city createdAt userId')
      .lean();
  }

  /**
   * Get user addresses with full details (Admin)
   */
  async getUserAddresses(userId: string, includeDeleted = false) {
    const query: FilterQuery<Address> = { userId: new Types.ObjectId(userId) };

    if (!includeDeleted) {
      query.deletedAt = null;
    }

    return await this.addressModel
      .find(query)
      .sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
      .lean();
  }

  /**
   * Get geographic analytics (Admin)
   */
  async getGeographicAnalytics() {
    const [cityDistribution, coordinatesData] = await Promise.all([
      // City distribution
      this.addressModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
            coordinates: { $push: '$coords' },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // All coordinates for heatmap
      this.addressModel
        .find({ deletedAt: null, coords: { $exists: true } })
        .select('coords city label')
        .lean(),
    ]);

    return {
      cityDistribution,
      coordinates: coordinatesData.map((addr) => ({
        lat: addr.coords.lat,
        lng: addr.coords.lng,
        city: addr.city,
        label: addr.label,
      })),
      totalPoints: coordinatesData.length,
    };
  }

  /**
   * Get usage analytics (Admin)
   */
  async getUsageAnalytics(startDate?: Date, endDate?: Date) {
    const matchQuery: Record<string, unknown> = { deletedAt: null };

    if (startDate || endDate) {
      matchQuery.lastUsedAt = {} as Record<string, Date>;
      if (startDate) (matchQuery.lastUsedAt as Record<string, Date>).$gte = startDate;
      if (endDate) (matchQuery.lastUsedAt as Record<string, Date>).$lte = endDate;
    }

    const [usageStats, dailyUsage] = await Promise.all([
      // Overall usage stats
      this.addressModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: '$usageCount' },
            avgUsage: { $avg: '$usageCount' },
            maxUsage: { $max: '$usageCount' },
            addressesUsed: {
              $sum: { $cond: [{ $gt: ['$usageCount', 0] }, 1, 0] },
            },
            addressesNeverUsed: {
              $sum: { $cond: [{ $eq: ['$usageCount', 0] }, 1, 0] },
            },
          },
        },
      ]),

      // Daily usage trend (if dates provided)
      startDate && endDate
        ? this.addressModel.aggregate([
            { $match: matchQuery },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$lastUsedAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ])
        : [],
    ]);

    return {
      stats: usageStats[0] || {
        totalUsage: 0,
        avgUsage: 0,
        maxUsage: 0,
        addressesUsed: 0,
        addressesNeverUsed: 0,
      },
      dailyTrend: dailyUsage,
    };
  }

  /**
   * Get address count for specific user (Admin)
   */
  async getUserAddressCount(userId: string): Promise<number> {
    return await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });
  }

  /**
   * Search addresses near coordinates (Admin)
   */
  async searchNearby(lat: number, lng: number, radiusInKm = 10, limit = 20) {
    const radiusInMeters = radiusInKm * 1000;

    return await this.addressModel
      .find({
        deletedAt: null,
        coords: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusInMeters,
          },
        },
      })
      .populate('userId', 'name phone')
      .limit(limit)
      .lean();
  }
}
