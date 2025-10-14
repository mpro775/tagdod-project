import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto, ListBrandsDto } from './dto/brand.dto';
import { AppException } from '../../shared/exceptions/app.exception';
import { generateSlug } from '../../shared/utils/slug.util';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}

  /**
   * Create a new brand
   */
  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    // Generate slug from name
    const slug = generateSlug(dto.name);

    // Check if slug already exists
    const existing = await this.brandModel.findOne({ slug });
    if (existing) {
      throw new AppException('Brand with this name already exists', 400);
    }

    const brand = new this.brandModel({
      ...dto,
      slug,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return await brand.save();
  }

  /**
   * Get all brands with filters and pagination
   */
  async listBrands(dto: ListBrandsDto) {
    const { page = 1, limit = 20, search, isActive, sortBy = 'sortOrder', sortOrder = 'asc' } = dto;
    
    const skip = (page - 1) * limit;
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [brands, total] = await Promise.all([
      this.brandModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.brandModel.countDocuments(query),
    ]);

    return {
      brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new AppException('Brand not found', 404);
    }
    return brand;
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandModel.findOne({ slug });
    if (!brand) {
      throw new AppException('Brand not found', 404);
    }
    return brand;
  }

  /**
   * Update brand
   */
  async updateBrand(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new AppException('Brand not found', 404);
    }

    // If name is being updated, regenerate slug
    if (dto.name && dto.name !== brand.name) {
      const newSlug = generateSlug(dto.name);
      const existing = await this.brandModel.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new AppException('Brand with this name already exists', 400);
      }
      brand.slug = newSlug;
    }

    // Update fields
    Object.assign(brand, dto);

    return await brand.save();
  }

  /**
   * Delete brand
   */
  async deleteBrand(id: string): Promise<void> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new AppException('Brand not found', 404);
    }

    // Note: You might want to check if there are products using this brand
    // and prevent deletion or unlink them first
    await this.brandModel.deleteOne({ _id: id });
  }

  /**
   * Get all active brands (for public use)
   */
  async getActiveBrands() {
    return await this.brandModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  /**
   * Toggle brand active status
   */
  async toggleBrandStatus(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new AppException('Brand not found', 404);
    }

    brand.isActive = !brand.isActive;
    return await brand.save();
  }
}

