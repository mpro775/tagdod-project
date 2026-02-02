import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as semver from 'semver';
import {
  AppVersionPolicy,
  AppVersionPolicyDocument,
} from './schemas/app-version-policy.schema';
import {
  AppVersionPolicyDto,
  AppConfigClientResponseDto,
  UpdateAppVersionPolicyDto,
  PlatformPolicyDto,
  POLICY_ID,
} from './dto/app-config.dto';

export type AppPlatform = 'android' | 'ios';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel(AppVersionPolicy.name)
    private readonly policyModel: Model<AppVersionPolicyDocument>,
  ) {
    this.ensureDefaultPolicy();
  }

  private async ensureDefaultPolicy(): Promise<void> {
    const exists = await this.policyModel.findOne({ policyId: POLICY_ID });
    if (!exists) {
      await this.policyModel.create({
        policyId: POLICY_ID,
        minVersion: process.env.APP_MIN_VERSION || '1.0.0',
        latestVersion: process.env.APP_LATEST_VERSION || '1.0.0',
        blockedVersions: [],
        forceUpdate: false,
        maintenanceMode: false,
        updateUrl: process.env.APP_UPDATE_URL || '',
      });
    }
  }

  async getPolicy(): Promise<AppVersionPolicyDto> {
    const doc = await this.policyModel
      .findOne({ policyId: POLICY_ID })
      .lean()
      .exec();
    if (!doc) {
      await this.ensureDefaultPolicy();
      const again = await this.policyModel
        .findOne({ policyId: POLICY_ID })
        .lean()
        .exec();
      if (!again) {
        return this.getDefaultPolicyDto();
      }
      return this.mapToDto(again);
    }
    return this.mapToDto(doc);
  }

  async updatePolicy(
    dto: UpdateAppVersionPolicyDto,
    userId: string,
  ): Promise<AppVersionPolicyDto> {
    const setFields: Record<string, unknown> = {
      ...(dto.minVersion !== undefined && { minVersion: dto.minVersion }),
      ...(dto.latestVersion !== undefined && {
        latestVersion: dto.latestVersion,
      }),
      ...(dto.blockedVersions !== undefined && {
        blockedVersions: dto.blockedVersions,
      }),
      ...(dto.forceUpdate !== undefined && { forceUpdate: dto.forceUpdate }),
      ...(dto.maintenanceMode !== undefined && {
        maintenanceMode: dto.maintenanceMode,
      }),
      ...(dto.updateUrl !== undefined && { updateUrl: dto.updateUrl }),
    };
    if (dto.android !== undefined) {
      setFields.android = this.normalizePlatformUpdate(dto.android);
    }
    if (dto.ios !== undefined) {
      setFields.ios = this.normalizePlatformUpdate(dto.ios);
    }
    const doc = await this.policyModel.findOneAndUpdate(
      { policyId: POLICY_ID },
      { $set: setFields },
      { new: true, upsert: true, setDefaultsOnCreate: true },
    );
    return this.mapToDto(doc.toObject());
  }

  private normalizePlatformUpdate(platform: {
    minVersion?: string;
    latestVersion?: string;
    updateUrl?: string;
    blockedVersions?: string[];
  }): {
    minVersion: string;
    latestVersion: string;
    updateUrl: string;
    blockedVersions: string[];
  } {
    return {
      minVersion: platform.minVersion ?? '1.0.0',
      latestVersion: platform.latestVersion ?? '1.0.0',
      updateUrl: platform.updateUrl ?? '',
      blockedVersions: Array.isArray(platform.blockedVersions)
        ? platform.blockedVersions
        : [],
    };
  }

  /**
   * Resolves platform-specific policy or falls back to root (default).
   */
  private resolvePlatformPolicy(
    fullPolicy: AppVersionPolicyDto,
    platform?: AppPlatform,
  ): Pick<
    AppVersionPolicyDto,
    'minVersion' | 'latestVersion' | 'updateUrl' | 'blockedVersions'
  > {
    if (platform === 'android' && fullPolicy.android) {
      return {
        minVersion: fullPolicy.android.minVersion ?? fullPolicy.minVersion,
        latestVersion: fullPolicy.android.latestVersion ?? fullPolicy.latestVersion,
        updateUrl: fullPolicy.android.updateUrl ?? fullPolicy.updateUrl,
        blockedVersions: fullPolicy.android.blockedVersions ?? fullPolicy.blockedVersions,
      };
    }
    if (platform === 'ios' && fullPolicy.ios) {
      return {
        minVersion: fullPolicy.ios.minVersion ?? fullPolicy.minVersion,
        latestVersion: fullPolicy.ios.latestVersion ?? fullPolicy.latestVersion,
        updateUrl: fullPolicy.ios.updateUrl ?? fullPolicy.updateUrl,
        blockedVersions: fullPolicy.ios.blockedVersions ?? fullPolicy.blockedVersions,
      };
    }
    return {
      minVersion: fullPolicy.minVersion,
      latestVersion: fullPolicy.latestVersion,
      updateUrl: fullPolicy.updateUrl,
      blockedVersions: fullPolicy.blockedVersions,
    };
  }

  /**
   * Returns policy plus shouldUpdate and canUse for the given app version.
   * If appVersion is not provided or invalid, shouldUpdate/canUse are omitted or default to safe values.
   * If platform is android|ios and that platform config exists, uses it; otherwise uses root (default).
   */
  async getConfigForClient(
    appVersion?: string,
    platform?: AppPlatform,
  ): Promise<AppConfigClientResponseDto> {
    const fullPolicy = await this.getPolicy();
    const resolved = this.resolvePlatformPolicy(fullPolicy, platform);
    const result: AppConfigClientResponseDto = {
      ...resolved,
      forceUpdate: fullPolicy.forceUpdate,
      maintenanceMode: fullPolicy.maintenanceMode,
    };

    if (appVersion && appVersion.trim()) {
      const version = appVersion.trim();
      let shouldUpdate = false;
      try {
        const inBlocked =
          Array.isArray(resolved.blockedVersions) &&
          resolved.blockedVersions.some((v) => {
            if (version === v) return true;
            const a = semver.coerce(version);
            const b = semver.coerce(v);
            return a && b && semver.eq(a, b);
          });
        const minVer = semver.coerce(resolved.minVersion);
        const curVer = semver.coerce(version);
        const outdated =
          minVer && curVer && semver.lt(curVer, minVer);
        shouldUpdate = Boolean(inBlocked || outdated);
      } catch {
        shouldUpdate = false;
      }
      result.shouldUpdate = shouldUpdate || fullPolicy.forceUpdate;
      result.canUse = !result.shouldUpdate && !fullPolicy.maintenanceMode;
    }

    return result;
  }

  /**
   * Returns true if the given app version is blocked or outdated (should receive 426).
   */
  async isVersionBlockedOrOutdated(
    appVersion: string,
    platform?: AppPlatform,
  ): Promise<boolean> {
    if (!appVersion || !appVersion.trim()) return false;
    const config = await this.getConfigForClient(appVersion.trim(), platform);
    return config.shouldUpdate === true || config.maintenanceMode === true;
  }

  private getDefaultPolicyDto(): AppVersionPolicyDto {
    return {
      minVersion: process.env.APP_MIN_VERSION || '1.0.0',
      latestVersion: process.env.APP_LATEST_VERSION || '1.0.0',
      blockedVersions: [],
      forceUpdate: false,
      maintenanceMode: false,
      updateUrl: process.env.APP_UPDATE_URL || '',
    };
  }

  private mapToDto(
    doc: AppVersionPolicy & { _id?: unknown; policyId?: string },
  ): AppVersionPolicyDto {
    const dto: AppVersionPolicyDto = {
      minVersion: doc.minVersion ?? '1.0.0',
      latestVersion: doc.latestVersion ?? '1.0.0',
      blockedVersions: Array.isArray(doc.blockedVersions) ? doc.blockedVersions : [],
      forceUpdate: doc.forceUpdate ?? false,
      maintenanceMode: doc.maintenanceMode ?? false,
      updateUrl: doc.updateUrl ?? '',
    };
    if (doc.android) {
      dto.android = {
        minVersion: doc.android.minVersion ?? '1.0.0',
        latestVersion: doc.android.latestVersion ?? '1.0.0',
        updateUrl: doc.android.updateUrl ?? '',
        blockedVersions: Array.isArray(doc.android.blockedVersions)
          ? doc.android.blockedVersions
          : [],
      };
    }
    if (doc.ios) {
      dto.ios = {
        minVersion: doc.ios.minVersion ?? '1.0.0',
        latestVersion: doc.ios.latestVersion ?? '1.0.0',
        updateUrl: doc.ios.updateUrl ?? '',
        blockedVersions: Array.isArray(doc.ios.blockedVersions)
          ? doc.ios.blockedVersions
          : [],
      };
    }
    return dto;
  }
}
