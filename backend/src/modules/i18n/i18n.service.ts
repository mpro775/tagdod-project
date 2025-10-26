import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Translation,
  TranslationDocument,
} from './schemas/translation.schema';
import {
  CreateTranslationDto,
  UpdateTranslationDto,
  TranslationsQueryDto,
  TranslationDto,
  TranslationStatsDto,
  BulkImportDto,
  ExportTranslationsDto,
  Language,
  TranslationNamespace,
} from './dto/i18n.dto';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);

  constructor(
    @InjectModel(Translation.name)
    private translationModel: Model<TranslationDocument>,
  ) {}

  // ==================== CRUD Operations ====================

  async createTranslation(
    dto: CreateTranslationDto,
    userId: string,
  ): Promise<TranslationDto> {
    // Check if key already exists
    const existing = await this.translationModel.findOne({ key: dto.key });
    if (existing) {
      throw new ConflictException(`Translation with key "${dto.key}" already exists`);
    }

    const translation = new this.translationModel({
      ...dto,
      namespace: dto.namespace || TranslationNamespace.COMMON,
      updatedBy: userId,
    });

    await translation.save();
    return this.mapToDto(translation);
  }

  async getTranslations(query: TranslationsQueryDto) {
    const { namespace, search, missingOnly, missingLanguage } = query;

    const filter: any = {};

    if (namespace) {
      filter.namespace = namespace;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (missingOnly && missingLanguage) {
      // Find translations where the specified language is empty or missing
      filter[missingLanguage] = { $in: [null, '', undefined] };
    }

    const translations = await this.translationModel
      .find(filter)
      .sort({ namespace: 1, key: 1 })
      .lean();

    return translations.map((t) => this.mapToDto(t));
  }

  async getTranslationByKey(key: string): Promise<TranslationDto> {
    const translation = await this.translationModel.findOne({ key }).lean();
    if (!translation) {
      throw new NotFoundException(`Translation with key "${key}" not found`);
    }
    return this.mapToDto(translation);
  }

  async updateTranslation(
    key: string,
    dto: UpdateTranslationDto,
    userId: string,
  ): Promise<TranslationDto> {
    const translation = await this.translationModel.findOne({ key });
    if (!translation) {
      throw new NotFoundException(`Translation with key "${key}" not found`);
    }

    if (dto.ar !== undefined) translation.ar = dto.ar;
    if (dto.en !== undefined) translation.en = dto.en;
    if (dto.namespace !== undefined) translation.namespace = dto.namespace;
    if (dto.description !== undefined) translation.description = dto.description;

    translation.updatedBy = userId;
    await translation.save();

    return this.mapToDto(translation);
  }

  async deleteTranslation(key: string): Promise<void> {
    const result = await this.translationModel.deleteOne({ key });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Translation with key "${key}" not found`);
    }
  }

  // ==================== Statistics ====================

  async getStatistics(): Promise<TranslationStatsDto> {
    const [
      total,
      byNamespace,
      missingArabic,
      missingEnglish,
      recentUpdates,
    ] = await Promise.all([
      this.translationModel.countDocuments(),
      this.getByNamespace(),
      this.translationModel.countDocuments({
        $or: [{ ar: '' }, { ar: null }, { ar: { $exists: false } }],
      }),
      this.translationModel.countDocuments({
        $or: [{ en: '' }, { en: null }, { en: { $exists: false } }],
      }),
      this.getRecentUpdates(),
    ]);

    const arabicCompleteness = total === 0 ? 100 : ((total - missingArabic) / total) * 100;
    const englishCompleteness = total === 0 ? 100 : ((total - missingEnglish) / total) * 100;

    return {
      totalTranslations: total,
      byNamespace,
      missingArabic,
      missingEnglish,
      arabicCompleteness,
      englishCompleteness,
      recentUpdates,
    };
  }

  // ==================== Bulk Operations ====================

  async bulkImport(
    dto: BulkImportDto,
    userId: string,
  ): Promise<{ imported: number; updated: number; skipped: number }> {
    const { translations, namespace, overwrite } = dto;

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const [key, value] of Object.entries(translations)) {
      try {
        const existing = await this.translationModel.findOne({ key });

        if (existing) {
          if (overwrite) {
            existing.ar = value.ar;
            existing.en = value.en;
            if (namespace) existing.namespace = namespace;
            if (value.description) existing.description = value.description;
            existing.updatedBy = userId;
            await existing.save();
            updated++;
          } else {
            skipped++;
          }
        } else {
          await this.translationModel.create({
            key,
            ar: value.ar,
            en: value.en,
            namespace: namespace || TranslationNamespace.COMMON,
            description: value.description,
            updatedBy: userId,
          });
          imported++;
        }
      } catch (error) {
        this.logger.error(`Error importing translation ${key}:`, error);
        skipped++;
      }
    }

    return { imported, updated, skipped };
  }

  async exportTranslations(dto: ExportTranslationsDto): Promise<any> {
    const { namespace, format, language } = dto;

    const filter: any = {};
    if (namespace) {
      filter.namespace = namespace;
    }

    const translations = await this.translationModel.find(filter).lean();

    if (format === 'csv') {
      return this.generateCSV(translations, language || 'both');
    }

    // JSON format
    return this.generateJSON(translations, language || 'both');
  }

  // ==================== Public API (for Frontend) ====================

  async getTranslationsForLanguage(lang: Language, namespace?: string): Promise<Record<string, string>> {
    const filter: any = {};
    if (namespace) {
      filter.namespace = namespace;
    }

    const translations = await this.translationModel.find(filter).lean();

    const result: Record<string, string> = {};
    translations.forEach((t) => {
      result[t.key] = t[lang] || '';
    });

    return result;
  }

  async getAllTranslationsGrouped(): Promise<Record<string, Record<string, any>>> {
    const translations = await this.translationModel.find().lean();

    const grouped: Record<string, Record<string, any>> = {};

    Object.values(TranslationNamespace).forEach((ns) => {
      grouped[ns] = { ar: {}, en: {} };
    });

    translations.forEach((t) => {
      const ns = t.namespace || 'common';
      if (!grouped[ns]) {
        grouped[ns] = { ar: {}, en: {} };
      }

      grouped[ns].ar[t.key] = t.ar;
      grouped[ns].en[t.key] = t.en;
    });

    return grouped;
  }

  // ==================== Helper Methods ====================

  private async getByNamespace(): Promise<Record<string, number>> {
    const results = await this.translationModel.aggregate([
      {
        $group: {
          _id: '$namespace',
          count: { $sum: 1 },
        },
      },
    ]);

    const byNamespace: Record<string, number> = {};
    results.forEach((r) => {
      byNamespace[r._id] = r.count;
    });

    return byNamespace;
  }

  private async getRecentUpdates() {
    const translations = await this.translationModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean<Array<Translation & { createdAt: Date; updatedAt: Date }>>();

    return translations.map((t) => ({
      key: t.key,
      updatedAt: t.updatedAt,
      updatedBy: t.updatedBy || 'unknown',
    }));
  }

  private mapToDto(translation: any): TranslationDto {
    return {
      id: translation._id.toString(),
      key: translation.key,
      ar: translation.ar,
      en: translation.en,
      namespace: translation.namespace,
      description: translation.description,
      createdAt: translation.createdAt,
      updatedAt: translation.updatedAt,
      updatedBy: translation.updatedBy,
    };
  }

  private generateJSON(translations: any[], language: Language | 'both'): any {
    if (language === 'both') {
      const result: Record<string, { ar: string; en: string }> = {};
      translations.forEach((t) => {
        result[t.key] = { ar: t.ar, en: t.en };
      });
      return result;
    }

    const result: Record<string, string> = {};
    translations.forEach((t) => {
      result[t.key] = t[language];
    });
    return result;
  }

  private generateCSV(translations: any[], language: Language | 'both'): string {
    const headers = language === 'both'
      ? ['Key', 'Arabic', 'English', 'Namespace', 'Description']
      : ['Key', language === Language.AR ? 'Arabic' : 'English', 'Namespace', 'Description'];

    const rows = translations.map((t) => {
      if (language === 'both') {
        return [
          t.key,
          t.ar,
          t.en,
          t.namespace,
          t.description || '',
        ];
      }

      return [
        t.key,
        t[language],
        t.namespace,
        t.description || '',
      ];
    });

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }
}

