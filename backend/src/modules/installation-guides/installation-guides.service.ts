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
  ListPublicInstallationGuidesDto,
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
  linkedProductId?: Types.ObjectId | null;
  linkedProductIds?: Types.ObjectId[];
  imageIds?: Array<Types.ObjectId | LeanMedia>;
  videoIds?: string[];
};
type LeanProductWithMedia = LeanProduct & {
  mainImageId?: Types.ObjectId | LeanMedia;
  imageIds?: Array<Types.ObjectId | LeanMedia>;
  pricingByCurrency?: Record<string, unknown>;
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
    const linkedProductIds = this.normalizeLinkedProductIds(dto);
    await this.validateLinkedProducts(linkedProductIds);

    const trimmedVideoId = dto.videoId?.trim();
    if (!trimmedVideoId) {
      throw new BadRequestException('videoId is required');
    }

    const actorId = this.toObjectId(userId, 'userId');
    const imageIds = (dto.imageIds ?? []).map((id) =>
      this.toObjectId(id, 'imageIds'),
    );
    const videoIds = (dto.videoIds ?? []).map((v) => v.trim()).filter(Boolean);

    const guide = await this.installationGuideModel.create({
      ...dto,
      videoId: trimmedVideoId,
      imageIds,
      videoIds,
      linkedProductId: linkedProductIds[0]
        ? this.toObjectId(linkedProductIds[0], 'linkedProductIds')
        : null,
      linkedProductIds: linkedProductIds.map((productId) =>
        this.toObjectId(productId, 'linkedProductIds'),
      ),
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
        .populate('imageIds', 'url')
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
      .populate('imageIds', 'url')
      .lean<LeanGuide | null>();

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    const linkedProductIds = this.extractLinkedProductIds(guide);
    const linkedProducts = await this.getLinkedProductPreviews(
      linkedProductIds,
      false,
    );
    const linkedProduct = linkedProducts[0] ?? null;
    const video = await this.buildVideoPayload(guide.videoId);
    const videos = await this.buildMultipleVideoPayloads(
      guide.videoIds ?? [],
    );
    if (video) videos.unshift(video);
    const imageUrls = this.extractMultipleMediaUrls(guide.imageIds);

    return {
      ...this.mapToListItem(guide),
      descriptionAr: guide.descriptionAr,
      descriptionEn: guide.descriptionEn,
      coverImageId:
        typeof guide.coverImageId === 'object' && guide.coverImageId !== null
          ? String((guide.coverImageId as LeanMedia)._id)
          : String(guide.coverImageId ?? ''),
      videoId: guide.videoId,
      imageIds: (guide.imageIds ?? []).map((img) =>
        typeof img === 'object' && img !== null
          ? String((img as unknown as LeanMedia)._id)
          : String(img),
      ),
      videoIds: guide.videoIds ?? [],
      imageUrls,
      videos,
      linkedProductId: guide.linkedProductId
        ? guide.linkedProductId.toString()
        : linkedProductIds[0] ?? null,
      linkedProductIds,
      video,
      linkedProduct,
      linkedProducts,
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

    if (dto.linkedProductIds !== undefined) {
      const linkedProductIds = this.normalizeLinkedProductIds(dto);
      await this.validateLinkedProducts(linkedProductIds);
      guide.linkedProductIds = linkedProductIds.map((productId) =>
        this.toObjectId(productId, 'linkedProductIds'),
      );
      guide.linkedProductId = linkedProductIds[0]
        ? this.toObjectId(linkedProductIds[0], 'linkedProductIds')
        : null;
    } else if (dto.linkedProductId !== undefined) {
      const normalizedLinkedProductId =
        typeof dto.linkedProductId === 'string'
          ? dto.linkedProductId.trim()
          : dto.linkedProductId;

      if (!normalizedLinkedProductId) {
        guide.linkedProductId = null;
        guide.linkedProductIds = [];
      } else {
        await this.validateLinkedProducts([normalizedLinkedProductId]);
        const productId = this.toObjectId(
          normalizedLinkedProductId,
          'linkedProductId',
        );
        guide.linkedProductId = productId;
        guide.linkedProductIds = [productId];
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

    if (dto.imageIds !== undefined) {
      guide.imageIds = dto.imageIds.map((id) =>
        this.toObjectId(id, 'imageIds'),
      );
    }

    if (dto.videoIds !== undefined) {
      guide.videoIds = dto.videoIds.map((v) => v.trim()).filter(Boolean);
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

  async listForPublic(
    dto?: ListPublicInstallationGuidesDto,
  ): Promise<{ data: InstallationGuideListItemDto[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const page = dto?.page ?? 1;
    const limit = dto?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { isActive: true };

    if (dto?.search?.trim()) {
      const escaped = this.escapeRegex(dto.search.trim());
      query.$or = [
        { titleAr: { $regex: escaped, $options: 'i' } },
        { titleEn: { $regex: escaped, $options: 'i' } },
        { tagAr: { $regex: escaped, $options: 'i' } },
        { tagEn: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (dto?.tag?.trim()) {
      const escapedTag = this.escapeRegex(dto.tag.trim());
      query.$and = [
        ...(query.$and ? query.$and as unknown[] : []),
        {
          $or: [
            { tagAr: { $regex: escapedTag, $options: 'i' } },
            { tagEn: { $regex: escapedTag, $options: 'i' } },
          ],
        },
      ];
    }

    const [guides, total] = await Promise.all([
      this.installationGuideModel
        .find(query)
        .populate('coverImageId', 'url')
        .sort({ sortOrder: 1, createdAt: -1 })
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

  async getByIdForPublic(id: string) {
    const guideId = this.toObjectId(id, 'installationGuideId');
    const guide = await this.installationGuideModel
      .findOne({ _id: guideId, isActive: true })
      .populate('coverImageId', 'url')
      .populate('imageIds', 'url')
      .lean<LeanGuide | null>();

    if (!guide) {
      throw new NotFoundException('Installation guide not found');
    }

    const linkedProductIds = this.extractLinkedProductIds(guide);
    const linkedProducts = await this.getLinkedProductPreviews(
      linkedProductIds,
      true,
    );
    const linkedProduct = linkedProducts[0] ?? null;
    const video = await this.buildVideoPayload(guide.videoId);
    const videos = await this.buildMultipleVideoPayloads(
      guide.videoIds ?? [],
    );
    if (video) videos.unshift(video);
    const imageUrls = this.extractMultipleMediaUrls(guide.imageIds);

    return {
      id: guide._id.toString(),
      titleAr: guide.titleAr,
      titleEn: guide.titleEn,
      tagAr: guide.tagAr,
      tagEn: guide.tagEn,
      descriptionAr: guide.descriptionAr,
      descriptionEn: guide.descriptionEn,
      coverImageUrl: this.extractMediaUrl(guide.coverImageId),
      imageIds: (guide.imageIds ?? []).map((img) =>
        typeof img === 'object' && img !== null
          ? String((img as unknown as LeanMedia)._id)
          : String(img),
      ),
      videoIds: guide.videoIds ?? [],
      imageUrls,
      videos,
      video,
      linkedProductIds: linkedProducts.map((product) => product.id),
      linkedProduct,
      linkedProducts,
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

  private async validateLinkedProducts(
    linkedProductIds?: string[] | null,
  ): Promise<void> {
    const uniqueIds = this.dedupeIds(linkedProductIds ?? []);
    if (uniqueIds.length === 0) return;

    const productIds = uniqueIds.map((productId) =>
      this.toObjectId(productId, 'linkedProductIds'),
    );
    const foundCount = await this.productModel.countDocuments({
      _id: { $in: productIds },
      deletedAt: null,
    });

    if (foundCount !== uniqueIds.length) {
      throw new BadRequestException('Invalid linkedProductIds');
    }
  }

  private async getLinkedProductPreviews(
    linkedProductIds: string[],
    requireActive: boolean,
  ): Promise<InstallationGuideLinkedProductDto[]> {
    const uniqueIds = this.dedupeIds(linkedProductIds);
    if (uniqueIds.length === 0) return [];

    const query: Record<string, unknown> = {
      _id: {
        $in: uniqueIds.map((productId) =>
          this.toObjectId(productId, 'linkedProductIds'),
        ),
      },
      deletedAt: null,
    };

    if (requireActive) {
      query.isActive = true;
      query.status = ProductStatus.ACTIVE;
    }

    const products = await this.productModel
      .find(query)
      .populate('mainImageId', 'url')
      .populate('imageIds', 'url')
      .lean<LeanProductWithMedia[]>();

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    return uniqueIds
      .map((productId) => productMap.get(productId))
      .filter((product): product is LeanProductWithMedia => Boolean(product))
      .map((product) => this.mapToLinkedProduct(product));
  }

  private mapToLinkedProduct(
    product: LeanProductWithMedia,
  ): InstallationGuideLinkedProductDto {
    const mainImageUrl = this.extractMediaUrl(product.mainImageId);
    const images = [
      ...(mainImageUrl ? [mainImageUrl] : []),
      ...((product.imageIds ?? [])
        .map((image) => this.extractMediaUrl(image))
        .filter((url): url is string => Boolean(url))),
    ];
    const rating = product.useManualRating
      ? product.manualRating ?? 0
      : product.averageRating ?? 0;
    const hasVariants = (product.variantsCount ?? 0) > 0;
    const stock = product.stock ?? 0;
    const isAvailable =
      product.isActive !== false &&
      product.status === ProductStatus.ACTIVE &&
      (hasVariants || stock > 0 || product.allowBackorder === true);

    return {
      id: product._id.toString(),
      name: product.name,
      nameEn: product.nameEn,
      ...(mainImageUrl ? { mainImageUrl } : {}),
      description: product.description,
      descriptionEn: product.descriptionEn,
      images,
      rating,
      price: this.buildPriceMap(product),
      ...(product.pricingByCurrency
        ? { pricingByCurrency: product.pricingByCurrency }
        : {}),
      tags: product.metaKeywords ?? [],
      requiresVariantSelection: hasVariants,
      isNew: product.isNew ?? false,
      isFeatured: product.isFeatured ?? false,
      hasVariants,
      isAvailable,
      stock,
      minOrderQuantity: product.minOrderQuantity,
      maxOrderQuantity: product.maxOrderQuantity,
    };
  }

  private buildPriceMap(product: LeanProductWithMedia): Record<string, number> {
    const price: Record<string, number> = {};
    if (typeof product.basePriceUSD === 'number' && product.basePriceUSD > 0) {
      price.USD = product.basePriceUSD;
    }
    if (typeof product.basePriceSAR === 'number' && product.basePriceSAR > 0) {
      price.SAR = product.basePriceSAR;
    }
    if (typeof product.basePriceYER === 'number' && product.basePriceYER > 0) {
      price.YER = product.basePriceYER;
    }
    return price;
  }

  private normalizeLinkedProductIds(
    dto: Pick<CreateInstallationGuideDto, 'linkedProductId' | 'linkedProductIds'>,
  ): string[] {
    if (Array.isArray(dto.linkedProductIds)) {
      return this.dedupeIds(dto.linkedProductIds);
    }

    const linkedProductId =
      typeof dto.linkedProductId === 'string'
        ? dto.linkedProductId.trim()
        : dto.linkedProductId;

    return linkedProductId ? [linkedProductId] : [];
  }

  private extractLinkedProductIds(guide: LeanGuide): string[] {
    const linkedProductIds = Array.isArray(guide.linkedProductIds)
      ? guide.linkedProductIds.map((productId) => productId.toString())
      : [];

    if (linkedProductIds.length > 0) {
      return this.dedupeIds(linkedProductIds);
    }

    return guide.linkedProductId ? [guide.linkedProductId.toString()] : [];
  }

  private dedupeIds(ids: string[]): string[] {
    const normalized: string[] = [];
    const seen = new Set<string>();

    ids.forEach((id) => {
      const value = id?.toString().trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      normalized.push(value);
    });

    return normalized;
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

  private extractMultipleMediaUrls(
    mediaArray: unknown,
  ): string[] {
    if (!Array.isArray(mediaArray)) return [];
    return mediaArray
      .map((media) => this.extractMediaUrl(media))
      .filter((url): url is string => Boolean(url));
  }

  private async buildMultipleVideoPayloads(
    videoIds: string[],
  ): Promise<InstallationGuideVideoDto[]> {
    if (!videoIds.length) return [];
    const results = await Promise.allSettled(
      videoIds.map((id) => this.buildVideoPayload(id)),
    );
    return results
      .filter(
        (r): r is PromiseFulfilledResult<InstallationGuideVideoDto> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);
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
