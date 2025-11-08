import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  LocalPaymentAccount, 
  LocalPaymentAccountDocument 
} from '../schemas/local-payment-account.schema';
import { 
  CreateLocalPaymentAccountDto, 
  UpdateLocalPaymentAccountDto, 
  GroupedPaymentAccountDto, 
  MediaReferenceDto, 
} from '../dto/local-payment-account.dto';
import { Media } from '../../upload/schemas/media.schema';
import { DomainException, ErrorCode } from '../../../shared/exceptions';

type AccountWithPopulatedMedia = LocalPaymentAccount & {
  _id: Types.ObjectId;
  iconMediaId?: Types.ObjectId | (Media & { _id: Types.ObjectId | string }) | string | null;
};

type AccountResponse = LocalPaymentAccount & {
  _id: string;
  iconMediaId?: string | null;
  icon?: MediaReferenceDto;
};

@Injectable()
export class LocalPaymentAccountService {
  constructor(
    @InjectModel(LocalPaymentAccount.name)
    private accountModel: Model<LocalPaymentAccountDocument>,
  ) {}

  async create(dto: CreateLocalPaymentAccountDto, userId: string): Promise<AccountResponse> {
    const { iconMediaId, ...rest } = dto;
    const normalizedIconMediaId = this.normalizeIconMediaId(iconMediaId);

    const account = new this.accountModel({
      ...rest,
      ...(normalizedIconMediaId !== undefined ? { iconMediaId: normalizedIconMediaId } : {}),
      isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder ?? 0,
      updatedBy: userId,
    });

    const savedAccount = await account.save();
    const populatedAccount = await savedAccount
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .catch(() => savedAccount);

    return this.enrichAccountWithMedia(
      populatedAccount.toObject() as AccountWithPopulatedMedia,
    );
  }

  async findAll(activeOnly: boolean = false): Promise<AccountResponse[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const accounts = await this.accountModel.find(filter)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1, currency: 1 })
      .lean<AccountWithPopulatedMedia[]>();

    return accounts.map((account) => this.enrichAccountWithMedia(account));
  }

  async findGrouped(activeOnly: boolean = false): Promise<GroupedPaymentAccountDto[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const accounts = await this.accountModel.find(filter)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1, currency: 1 })
      .lean<AccountWithPopulatedMedia[]>();

    // تجميع الحسابات حسب providerName
    const grouped = new Map<string, GroupedPaymentAccountDto>();

    accounts.forEach(account => {
      const enriched = this.enrichAccountWithMedia(account);
      if (!grouped.has(account.providerName)) {
        grouped.set(account.providerName, {
          providerName: enriched.providerName,
          icon: enriched.icon ?? undefined,
          type: enriched.type,
          accounts: [],
        });
      }

      const group = grouped.get(account.providerName)!;
      group.accounts.push({
        id: enriched._id.toString(),
        accountNumber: enriched.accountNumber,
        currency: enriched.currency,
        isActive: enriched.isActive,
        displayOrder: enriched.displayOrder,
      });
    });

    return Array.from(grouped.values());
  }

  async findByCurrency(currency: string, activeOnly: boolean = true): Promise<GroupedPaymentAccountDto[]> {
    const filter: { currency: string; isActive?: boolean } = { currency };
    if (activeOnly) {
      filter.isActive = true;
    }

    const accounts = await this.accountModel.find(filter)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1 })
      .lean<AccountWithPopulatedMedia[]>();

    // تجميع حسب providerName
    const grouped = new Map<string, GroupedPaymentAccountDto>();

    accounts.forEach(account => {
      const enriched = this.enrichAccountWithMedia(account);
      if (!grouped.has(account.providerName)) {
        grouped.set(account.providerName, {
          providerName: enriched.providerName,
          icon: enriched.icon ?? undefined,
          type: enriched.type,
          accounts: [],
        });
      }

      const group = grouped.get(account.providerName)!;
      group.accounts.push({
        id: enriched._id.toString(),
        accountNumber: enriched.accountNumber,
        currency: enriched.currency,
        isActive: enriched.isActive,
        displayOrder: enriched.displayOrder,
      });
    });

    return Array.from(grouped.values());
  }

  async findById(id: string): Promise<AccountResponse | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const account = await this.accountModel
      .findById(id)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      });

    if (!account) {
      return null;
    }

    return this.enrichAccountWithMedia(account.toObject() as AccountWithPopulatedMedia);
  }

  async update(id: string, dto: UpdateLocalPaymentAccountDto, userId: string): Promise<AccountResponse> {
    const { iconMediaId, ...rest } = dto;
    const normalizedIconMediaId = this.normalizeIconMediaId(iconMediaId);

    const updatePayload: Record<string, unknown> = {
      ...rest,
      updatedBy: userId,
    };

    if (normalizedIconMediaId !== undefined) {
      updatePayload.iconMediaId = normalizedIconMediaId;
    }

    const account = await this.accountModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true },
    );
    
    if (!account) {
      throw new NotFoundException(`Local payment account with ID ${id} not found`);
    }

    const populatedAccount = await account.populate({
      path: 'iconMediaId',
      match: { deletedAt: null },
    });
    
    return this.enrichAccountWithMedia(populatedAccount.toObject() as AccountWithPopulatedMedia);
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.findByIdAndDelete(id);
  }

  async getProviderNames(): Promise<string[]> {
    const providers = await this.accountModel.distinct('providerName');
    return providers.sort();
  }

  private enrichAccountWithMedia(
    account: AccountWithPopulatedMedia,
  ): AccountResponse {
    let icon: MediaReferenceDto | undefined;
    let iconMediaId: string | null = null;

    if (this.isPopulatedMedia(account.iconMediaId)) {
      const resolvedId = (account.iconMediaId._id instanceof Types.ObjectId)
        ? account.iconMediaId._id.toString()
        : account.iconMediaId._id;
      iconMediaId = resolvedId;
      icon = {
        id: resolvedId,
        url: account.iconMediaId.url,
        name: account.iconMediaId.name,
      };
    } else if (account.iconMediaId instanceof Types.ObjectId) {
      iconMediaId = account.iconMediaId.toString();
    } else if (typeof account.iconMediaId === 'string') {
      iconMediaId = account.iconMediaId;
    }

    const serializedAccount = {
      ...(account as unknown as Record<string, unknown>),
      _id: account._id.toString(),
      iconMediaId: iconMediaId ?? undefined,
      icon,
    };

    return serializedAccount as AccountResponse;
  }

  private isPopulatedMedia(
    media: unknown,
  ): media is Media & { _id: Types.ObjectId | string } {
    return Boolean(
      media &&
      typeof media === 'object' &&
      'url' in (media as Record<string, unknown>) &&
      'name' in (media as Record<string, unknown>),
    );
  }

  private normalizeIconMediaId(iconMediaId?: string | null): Types.ObjectId | null | undefined {
    if (iconMediaId === undefined) {
      return undefined;
    }

    if (iconMediaId === null || iconMediaId === '') {
      return null;
    }

    if (!Types.ObjectId.isValid(iconMediaId)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        field: 'iconMediaId',
        reason: 'invalid_media_id',
      });
    }

    return new Types.ObjectId(iconMediaId);
  }
}

