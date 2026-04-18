import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument } from '../upload/schemas/media.schema';
import { BunnyStreamService } from '../upload/bunny-stream.service';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../products/schemas/product.schema';
import {
  CreateInstallationGuideDto,
  InstallationGuideDetailDto,
  InstallationGuideLinkedProductDto,
  InstallationGuideListItemDto,
  InstallationGuideVideoDto,
  ListInstallationGuidesDto,
  UpdateInstallationGuideDto,
} from './dto/installation-guide.dto';
import {
  InstallationGuide,
  InstallationGuideDocument,
} from './schemas/installation-guide.schema';

type LeanMedia = Media & { _id: Types.ObjectId };
type LeanProduct = Product & { _id: Types.ObjectId };
type LeanGuide = InstallationGuide & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  coverImageId?: Types.ObjectId | LeanMedia;
};

@Injectable()
export class InstallationGuidesService {
  private readonly bunnyStreamLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
  private readonly bunnyStreamCdnHost =
    process.env.BUNNY_STREAM_CDN_HOSTNAME ||
    (this.bunnyStreamLibraryId ? `${this.bunnyStreamLibraryId}.b-cdn.net` : '');

  constructor(
    @InjectModel(InstallationGuide.name)
    private readonly installationGuideModel: Model<InstallationGuideDocument>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly bunnyStreamService: BunnyStreamService,
  ) {}

  async create(
    dto: CreateInstallationGuideDto,
    userId: string,
  ): Promise<InstallationGuideDetailDto> {
    await this.validateCoverImage(dto.coverImageId);
    await this.validateLinkedProduct(dto.linkedProductId);

    const trimmedVideoId = dto.videoId?.trim();
    if (!trimmedVideoId) {
      throw new BadRequestException('videoId is required');
    }

    const actorId = this.toObjectId(userId, 'userId');
    const guide = await this.installationGuideModel.create({
      ...dto,
      videoId: trimmedVideoId,
      linkedProductId: dto.linkedProductId
        ? this.toObjectId(dto.linkedProductId, 'linkedProductId')
        : null,
      createdBy: actorId,
      lastUpdatedBy: actorId,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.getByIdForAdmin(guide._id.toString());
  }

  async listForAdmin(dto: ListInstallationGuidesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (typeof dto.isActive === 'boolean') {
      query.isActive = dto.isActive;
    }

    if (dto.search?.trim()) {
      const escaped = this.escapeRegex(dto.search.trim());
      query.$or = [
        { titleAr: { $regex: escaped, $options: 'i' } },
        { titleEn: { $regex: escaped, $options: 'i' } },
        { tagAr: { $regex: escaped, $options: 'i' } },
        { tagEn: { $regex: escaped, $options: 'i' } },
      ];
    }

    const allowedSortFields = new Set([
      'sortOrder',
      'titleAr',
      'titleEn',
      'tagAr',
      'tagEn',
      'isActive',
      'createdAt',
      'updatedAt',
    ]);
    const sortBy =
      dto.sortBy && allowedSortFields.has(dto.sortBy) ? dto.sortBy : 'sortOrder';
    const sortDirection: 1 | -1 = dto.sortOrder === 'desc' ? -1 : 1;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection };
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

    const [guides, total] = await Promise.all([
      this.installationGuideModel
        .find(query)
        .populate('coverImageId', 'url')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<LeanGuide[]>(),
      this.installationGuideModel.countDocuments(query),
    ]);

    return {
      data: guides.map((guide) => this.mapToListItem(guide)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getByIdForAdmin(id: string): Promise<InstallationGuideDetailDto> {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const guide = await this.installationGuideModel
      .findById(guideId)
      .populate('coverImageId', 'url')
      .lean<LeanGuide | null>();

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    const linkedProduct = await this.getLinkedProductPreview(
      guide.linkedProductId?.toString() ?? null,
      false,
    );
    const video = await this.buildVideoPayload(guide.videoId);

    return {
      ...this.mapToListItem(guide),
      descriptionAr: guide.descriptionAr,
      descriptionEn: guide.descriptionEn,
      coverImageId:
        typeof guide.coverImageId === 'object' && guide.coverImageId !== null
          ? String((guide.coverImageId as LeanMedia)._id)
          : String(guide.coverImageId ?? ''),
      videoId: guide.videoId,
      linkedProductId: guide.linkedProductId
        ? guide.linkedProductId.toString()
        : null,
      video,
      linkedProduct,
      createdAt: guide.createdAt,
    };
  }

  async update(
    id: string,
    dto: UpdateInstallationGuideDto,
    userId: string,
  ): Promise<InstallationGuideDetailDto> {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const guide = await this.installationGuideModel.findById(guideId);

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    if (dto.coverImageId) {
      await this.validateCoverImage(dto.coverImageId);
      guide.coverImageId = this.toObjectId(dto.coverImageId, 'coverImageId');
    }

    if (dto.linkedProductId !== undefined) {
      const normalizedLinkedProductId =
        typeof dto.linkedProductId === 'string'
          ? dto.linkedProductId.trim()
          : dto.linkedProductId;

      if (!normalizedLinkedProductId) {
        guide.linkedProductId = null;
      } else {
        await this.validateLinkedProduct(normalizedLinkedProductId);
        guide.linkedProductId = this.toObjectId(
          normalizedLinkedProductId,
          'linkedProductId',
        );
      }
    }

    if (dto.videoId !== undefined) {
      const trimmedVideoId = dto.videoId.trim();
      if (!trimmedVideoId) {
        throw new BadRequestException('videoId is required');
      }
      guide.videoId = trimmedVideoId;
    }

    if (!guide.videoId?.trim()) {
      throw new BadRequestException('videoId is required');
    }

    if (dto.titleAr !== undefined) guide.titleAr = dto.titleAr;
    if (dto.titleEn !== undefined) guide.titleEn = dto.titleEn;
    if (dto.tagAr !== undefined) guide.tagAr = dto.tagAr;
    if (dto.tagEn !== undefined) guide.tagEn = dto.tagEn;
    if (dto.descriptionAr !== undefined) guide.descriptionAr = dto.descriptionAr;
    if (dto.descriptionEn !== undefined) guide.descriptionEn = dto.descriptionEn;
    if (dto.sortOrder !== undefined) guide.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) guide.isActive = dto.isActive;

    guide.lastUpdatedBy = this.toObjectId(userId, 'userId');

    await guide.save();
    return this.getByIdForAdmin(id);
  }

  async toggle(id: string, isActive: boolean, userId: string) {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const guide = await this.installationGuideModel.findById(guideId);

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    guide.isActive = isActive;
    guide.lastUpdatedBy = this.toObjectId(userId, 'userId');
    await guide.save();

    return this.getByIdForAdmin(id);
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const result = await this.installationGuideModel.findByIdAndDelete(guideId);

    if (!result) {
      throw new NotFoundException('Installation guide not found');
    }

    return { deleted: true };
  }

  async listForPublic(): Promise<InstallationGuideListItemDto[]> {
    const guides = await this.installationGuideModel
      .find({ isActive: true })
      .populate('coverImageId', 'url')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean<LeanGuide[]>();

    return guides.map((guide) => this.mapToListItem(guide));
  }

  async getByIdForPublic(id: string) {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const guide = await this.installationGuideModel
      .findOne({ _id: guideId, isActive: true })
      .populate('coverImageId', 'url')
      .lean<LeanGuide | null>();

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    const linkedProduct = await this.getLinkedProductPreview(
      guide.linkedProductId?.toString() ?? null,
      true,
    );
    const video = await this.buildVideoPayload(guide.videoId);

    return {
      id: guide._id.toString(),
      titleAr: guide.titleAr,
      titleEn: guide.titleEn,
      tagAr: guide.tagAr,
      tagEn: guide.tagEn,
      descriptionAr: guide.descriptionAr,
      descriptionEn: guide.descriptionEn,
      coverImageUrl: this.extractMediaUrl(guide.coverImageId),
      video,
      linkedProduct,
    };
  }

  private async validateCoverImage(coverImageId: string): Promise<void> {
    const mediaId = this.toObjectId(coverImageId, 'coverImageId');
    const media = await this.mediaModel.findOne({
      _id: mediaId,
      deletedAt: null,
    });

    if (!media) {
      throw new BadRequestException('Invalid coverImageId');
    }
  }

  private async validateLinkedProduct(
    linkedProductId?: string | null,
  ): Promise<void> {
    if (!linkedProductId) return;

    const productId = this.toObjectId(linkedProductId, 'linkedProductId');
    const product = await this.productModel.findOne({
      _id: productId,
      deletedAt: null,
    });

    if (!product) {
      throw new BadRequestException('Invalid linkedProductId');
    }
  }

  private async getLinkedProductPreview(
    linkedProductId: string | null,
    requireActive: boolean,
  ): Promise<InstallationGuideLinkedProductDto | null> {
    if (!linkedProductId) return null;

    const productId = this.toObjectId(linkedProductId, 'linkedProductId');
    const query: Record<string, unknown> = {
      _id: productId,
      deletedAt: null,
    };

    if (requireActive) {
      query.isActive = true;
      query.status = ProductStatus.ACTIVE;
    }

    const product = await this.productModel
      .findOne(query)
      .populate('mainImageId', 'url')
      .lean<LeanProduct & { mainImageId?: Types.ObjectId | LeanMedia }>();

    if (!product) return null;

    const mainImageUrl =
      product.mainImageId &&
      typeof product.mainImageId === 'object' &&
      'url' in product.mainImageId
        ? (product.mainImageId as LeanMedia).url
        : undefined;

    return {
      id: product._id.toString(),
      name: product.name,
      nameEn: product.nameEn,
      ...(mainImageUrl ? { mainImageUrl } : {}),
    };
  }

  private async buildVideoPayload(
    videoId: string,
  ): Promise<InstallationGuideVideoDto> {
    try {
      const info = await this.bunnyStreamService.getVideoInfo(videoId);
      return {
        id: info.guid || info.id || videoId,
        url: info.url,
        ...(info.embedUrl ? { embedUrl: info.embedUrl } : {}),
        ...(info.hlsUrl ? { hlsUrl: info.hlsUrl } : {}),
        ...(info.mp4Url ? { mp4Url: info.mp4Url } : {}),
        ...(info.thumbnailUrl ? { thumbnailUrl: info.thumbnailUrl } : {}),
        status: info.status,
      };
    } catch {
      const embedUrl = this.bunnyStreamLibraryId
        ? `https://iframe.mediadelivery.net/embed/${this.bunnyStreamLibraryId}/${videoId}`
        : undefined;
      const hlsUrl = this.bunnyStreamCdnHost
        ? `https://${this.bunnyStreamCdnHost}/${videoId}/playlist.m3u8`
        : undefined;
      const mp4Url = this.bunnyStreamCdnHost
        ? `https://${this.bunnyStreamCdnHost}/${videoId}/play_720p.mp4`
        : undefined;
      const thumbnailUrl = this.bunnyStreamCdnHost
        ? `https://${this.bunnyStreamCdnHost}/${videoId}/thumbnail.jpg`
        : undefined;

      return {
        id: videoId,
        url: embedUrl ?? hlsUrl ?? mp4Url ?? videoId,
        ...(embedUrl ? { embedUrl } : {}),
        ...(hlsUrl ? { hlsUrl } : {}),
        ...(mp4Url ? { mp4Url } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        status: 'processing',
      };
    }
  }

  private mapToListItem(guide: LeanGuide): InstallationGuideListItemDto {
    return {
      id: guide._id.toString(),
      titleAr: guide.titleAr,
      titleEn: guide.titleEn,
      tagAr: guide.tagAr,
      tagEn: guide.tagEn,
      coverImageUrl: this.extractMediaUrl(guide.coverImageId),
      isActive: guide.isActive,
      sortOrder: guide.sortOrder ?? 0,
      updatedAt: guide.updatedAt,
    };
  }

  private extractMediaUrl(media: unknown): string | undefined {
    if (!media || typeof media !== 'object') return undefined;
    const url = (media as { url?: unknown }).url;
    return typeof url === 'string' ? url : undefined;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }
}
