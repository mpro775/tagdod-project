import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument, ArticleStatus } from './schemas/article.schema';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto, ReorderArticleDto } from './dto/article.dto';
import { slugify } from '../../shared/utils/slug.util';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    const slug = dto.slug || slugify(dto.titleAr);

    const existing = await this.articleModel.findOne({ slug });
    if (existing) {
      throw new Error('مقال بنفس الرابط المختصر موجود بالفعل');
    }

    const article = new this.articleModel({
      ...dto,
      slug,
      status: dto.status ?? 'draft',
      showOnLanding: dto.showOnLanding ?? false,
      landingOrder: dto.landingOrder ?? 0,
      isFeatured: dto.isFeatured ?? false,
      type: dto.type ?? 'article',
    });

    return await article.save();
  }

  async findAll(dto: ArticleQueryDto) {
    const { page = 1, limit = 20, search, type, category, status, showOnLanding, isFeatured } = dto;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { deletedAt: null };

    if (search) {
      query.$or = [
        { titleAr: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { excerptAr: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (typeof showOnLanding === 'boolean') query.showOnLanding = showOnLanding;
    if (typeof isFeatured === 'boolean') query.isFeatured = isFeatured;

    const [articles, total] = await Promise.all([
      this.articleModel.find(query).sort({ landingOrder: 1, publishDate: -1 }).skip(skip).limit(limit).lean(),
      this.articleModel.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!article) {
      throw new NotFoundException('المقال غير موجود');
    }
    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleModel.findOne({ slug, status: 'published', deletedAt: null }).lean().exec();
    if (!article) {
      throw new NotFoundException('المقال غير موجود');
    }
    return article as unknown as Article;
  }

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findById(id);

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.articleModel.findOne({ slug: dto.slug, _id: { $ne: id } });
      if (existing) {
        throw new Error('مقال بنفس الرابط المختصر موجود بالفعل');
      }
    }

    Object.assign(article, dto);
    const saved = await article.save();
    return saved.toObject() as Article;
  }

  async delete(id: string): Promise<void> {
    const article = await this.findById(id);
    article.deletedAt = new Date();
    await article.save();
  }

  async publish(id: string): Promise<Article> {
    const article = await this.findById(id);
    article.status = ArticleStatus.PUBLISHED;
    if (!article.publishDate) {
      article.publishDate = new Date();
    }
    const saved = await article.save();
    return saved.toObject() as Article;
  }

  async archive(id: string): Promise<Article> {
    const article = await this.findById(id);
    article.status = ArticleStatus.ARCHIVED;
    const saved = await article.save();
    return saved.toObject() as Article;
  }

  async toggleLanding(id: string): Promise<Article> {
    const article = await this.findById(id);
    article.showOnLanding = !article.showOnLanding;
    const saved = await article.save();
    return saved.toObject() as Article;
  }

  async reorder(dto: ReorderArticleDto): Promise<void> {
    const bulkOps = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { landingOrder: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.articleModel.bulkWrite(bulkOps);
    }
  }

  async getLandingArticles() {
    return await this.articleModel
      .find({ showOnLanding: true, status: 'published', deletedAt: null })
      .sort({ landingOrder: 1, publishDate: -1 })
      .limit(10)
      .lean();
  }

  async getFeatured(): Promise<Article[]> {
    return await this.articleModel
      .find({ isFeatured: true, status: 'published', deletedAt: null })
      .sort({ landingOrder: 1, publishDate: -1 })
      .lean();
  }

  async getStats() {
    const [total, published, draft, archived, onLanding, byType] = await Promise.all([
      this.articleModel.countDocuments({ deletedAt: null }),
      this.articleModel.countDocuments({ status: 'published', deletedAt: null }),
      this.articleModel.countDocuments({ status: 'draft', deletedAt: null }),
      this.articleModel.countDocuments({ status: 'archived', deletedAt: null }),
      this.articleModel.countDocuments({ showOnLanding: true, status: 'published', deletedAt: null }),
      this.articleModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      onLanding,
      byType,
    };
  }
}
