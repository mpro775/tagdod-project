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
  POLICY_ID,
} from './dto/app-config.dto';

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
    const doc = await this.policyModel.findOneAndUpdate(
      { policyId: POLICY_ID },
      {
        $set: {
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
        },
      },
      { new: true, upsert: true, setDefaultsOnCreate: true },
    );
    return this.mapToDto(doc.toObject());
  }

  /**
   * Returns policy plus shouldUpdate and canUse for the given app version.
   * If appVersion is not provided or invalid, shouldUpdate/canUse are omitted or default to safe values.
   */
  async getConfigForClient(
    appVersion?: string,
  ): Promise<AppConfigClientResponseDto> {
    const policy = await this.getPolicy();
    const result: AppConfigClientResponseDto = {
      ...policy,
    };

    if (appVersion && appVersion.trim()) {
      const version = appVersion.trim();
      let shouldUpdate = false;
      try {
        const inBlocked =
          Array.isArray(policy.blockedVersions) &&
          policy.blockedVersions.some((v) => {
            if (version === v) return true;
            const a = semver.coerce(version);
            const b = semver.coerce(v);
            return a && b && semver.eq(a, b);
          });
        const minVer = semver.coerce(policy.minVersion);
        const curVer = semver.coerce(version);
        const outdated =
          minVer && curVer && semver.lt(curVer, minVer);
        shouldUpdate = Boolean(inBlocked || outdated);
      } catch {
        shouldUpdate = false;
      }
      result.shouldUpdate = shouldUpdate || policy.forceUpdate;
      result.canUse = !result.shouldUpdate && !policy.maintenanceMode;
    }

    return result;
  }

  /**
   * Returns true if the given app version is blocked or outdated (should receive 426).
   */
  async isVersionBlockedOrOutdated(appVersion: string): Promise<boolean> {
    if (!appVersion || !appVersion.trim()) return false;
    const config = await this.getConfigForClient(appVersion.trim());
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
    return {
      minVersion: doc.minVersion ?? '1.0.0',
      latestVersion: doc.latestVersion ?? '1.0.0',
      blockedVersions: Array.isArray(doc.blockedVersions) ? doc.blockedVersions : [],
      forceUpdate: doc.forceUpdate ?? false,
      maintenanceMode: doc.maintenanceMode ?? false,
      updateUrl: doc.updateUrl ?? '',
    };
  }
}
