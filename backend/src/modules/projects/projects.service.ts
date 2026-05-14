import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, ReorderProjectDto } from './dto/project.dto';
import { slugify } from '../../shared/utils/slug.util';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const slug = dto.slug || slugify(dto.titleAr);

    const existing = await this.projectModel.findOne({ slug });
    if (existing) {
      throw new Error('مشروع بنفس الرابط المختصر موجود بالفعل');
    }

    const project = new this.projectModel({
      ...dto,
      slug,
      isPublished: dto.isPublished ?? false,
      showOnLanding: dto.showOnLanding ?? false,
      landingOrder: dto.landingOrder ?? 0,
      isFeatured: dto.isFeatured ?? false,
      status: dto.status ?? 'planned',
      type: dto.type ?? 'other',
    });

    return await project.save();
  }

  async findAll(dto: ProjectQueryDto) {
    const { page = 1, limit = 20, search, type, status, isPublished, showOnLanding, isFeatured } = dto;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { deletedAt: null };

    if (search) {
      query.$or = [
        { titleAr: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { descriptionAr: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (typeof isPublished === 'boolean') query.isPublished = isPublished;
    if (typeof showOnLanding === 'boolean') query.showOnLanding = showOnLanding;
    if (typeof isFeatured === 'boolean') query.isFeatured = isFeatured;

    const [projects, total] = await Promise.all([
      this.projectModel.find(query).sort({ landingOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.projectModel.countDocuments(query),
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }
    return project;
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectModel.findOne({ slug, isPublished: true, deletedAt: null }).lean().exec();
    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }
    return project as unknown as Project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);

    if (dto.slug && dto.slug !== project.slug) {
      const existing = await this.projectModel.findOne({ slug: dto.slug, _id: { $ne: id } });
      if (existing) {
        throw new Error('مشروع بنفس الرابط المختصر موجود بالفعل');
      }
    }

    Object.assign(project, dto);
    const saved = await project.save();
    return saved.toObject() as Project;
  }

  async delete(id: string): Promise<void> {
    const project = await this.findById(id);
    project.deletedAt = new Date();
    await project.save();
  }

  async togglePublished(id: string): Promise<Project> {
    const project = await this.findById(id);
    project.isPublished = !project.isPublished;
    const saved = await project.save();
    return saved.toObject() as Project;
  }

  async toggleLanding(id: string): Promise<Project> {
    const project = await this.findById(id);
    project.showOnLanding = !project.showOnLanding;
    const saved = await project.save();
    return saved.toObject() as Project;
  }

  async reorder(dto: ReorderProjectDto): Promise<void> {
    const bulkOps = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { landingOrder: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.projectModel.bulkWrite(bulkOps);
    }
  }

  async getLandingProjects() {
    return await this.projectModel
      .find({ showOnLanding: true, isPublished: true, deletedAt: null })
      .sort({ landingOrder: 1, createdAt: -1 })
      .lean();
  }

  async getFeatured(): Promise<Project[]> {
    return await this.projectModel
      .find({ isFeatured: true, isPublished: true, deletedAt: null })
      .sort({ landingOrder: 1, createdAt: -1 })
      .lean();
  }

  async getStats() {
    const [total, published, onLanding, byType, byStatus] = await Promise.all([
      this.projectModel.countDocuments({ deletedAt: null }),
      this.projectModel.countDocuments({ isPublished: true, deletedAt: null }),
      this.projectModel.countDocuments({ showOnLanding: true, isPublished: true, deletedAt: null }),
      this.projectModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.projectModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      published,
      onLanding,
      byType,
      byStatus,
    };
  }
}
