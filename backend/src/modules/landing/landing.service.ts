import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LandingSettings, LandingSettingsDocument } from './schemas/landing-settings.schema';
import { UpdateLandingSettingsDto } from './dto/landing.dto';
import { AboutService } from '../about/about.service';
import { BrandsService } from '../brands/brands.service';
import { ProductService } from '../products/services/product.service';
import { ProjectsService } from '../projects/projects.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class LandingService {
  constructor(
    @InjectModel(LandingSettings.name)
    private landingSettingsModel: Model<LandingSettingsDocument>,
    private aboutService: AboutService,
    private brandsService: BrandsService,
    private productService: ProductService,
    private projectsService: ProjectsService,
    private articlesService: ArticlesService,
  ) {}

  async getSettings(): Promise<LandingSettings | null> {
    const settings = await this.landingSettingsModel.findOne().lean().exec();
    return settings;
  }

  async updateSettings(dto: UpdateLandingSettingsDto): Promise<LandingSettings> {
    let settings = await this.landingSettingsModel.findOne().exec();

    if (!settings) {
      settings = new this.landingSettingsModel(dto);
    } else {
      Object.assign(settings, dto);
    }

    return await settings.save();
  }

  async getHomeData() {
    const settings = await this.getSettings();

    const [about, brandsResult, productsResult, projectsResult, articlesResult] = await Promise.allSettled([
      this.aboutService.getPublic(),
      this.brandsService.getLandingBrands(),
      this.productService.getLandingShowcase(),
      this.projectsService.getLandingProjects(),
      this.articlesService.getLandingArticles(),
    ]);

    const aboutData = about.status === 'fulfilled' ? about.value : null;
    const brandsData = brandsResult.status === 'fulfilled' ? brandsResult.value : [];
    const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];
    const projectsData = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
    const articlesData = articlesResult.status === 'fulfilled' ? articlesResult.value : [];

    const stats = aboutData?.stats || [];
    const contactInfo = aboutData?.contactInfo || null;

    return {
      settings: settings || this.getDefaultSettings(),
      about: aboutData
        ? {
            titleAr: aboutData.titleAr,
            titleEn: aboutData.titleEn,
            descriptionAr: aboutData.descriptionAr,
            descriptionEn: aboutData.descriptionEn,
            heroImage: aboutData.heroImage,
            visionAr: aboutData.visionAr,
            visionEn: aboutData.visionEn,
            missionAr: aboutData.missionAr,
            missionEn: aboutData.missionEn,
            values: aboutData.values || [],
            teamMembers: aboutData.teamMembers || [],
            stats: aboutData.stats || [],
            contactInfo: aboutData.contactInfo,
          }
        : null,
      stats,
      features: [],
      products: productsData,
      projects: projectsData,
      brands: brandsData,
      articles: articlesData,
      contactInfo,
      serviceCenter: contactInfo
        ? {
            workingHoursAr: contactInfo.workingHoursAr,
            workingHoursEn: contactInfo.workingHoursEn,
            phone: contactInfo.phone,
            email: contactInfo.email,
            addressAr: contactInfo.addressAr,
            addressEn: contactInfo.addressEn,
          }
        : null,
    };
  }

  private getDefaultSettings(): Partial<LandingSettings> {
    return {
      heroTitleAr: '',
      heroTitleEn: '',
      heroSubtitleAr: '',
      heroSubtitleEn: '',
      heroImage: '',
      primaryCtaTextAr: '',
      primaryCtaTextEn: '',
      primaryCtaUrl: '',
      secondaryCtaTextAr: '',
      secondaryCtaTextEn: '',
      secondaryCtaUrl: '',
      appStoreUrl: '',
      playStoreUrl: '',
      enableAboutSection: true,
      enableStatsSection: true,
      enableFeaturesSection: true,
      enableProductsSection: true,
      enableProjectsSection: true,
      enableBrandsSection: true,
      enableArticlesSection: true,
      enableContactSection: true,
      enableServiceCenterSection: true,
      sectionOrder: ['hero', 'about', 'stats', 'features', 'products', 'projects', 'brands', 'articles', 'serviceCenter', 'contact', 'appShowcase', 'downloadCta'],
      isPublished: true,
    };
  }
}
