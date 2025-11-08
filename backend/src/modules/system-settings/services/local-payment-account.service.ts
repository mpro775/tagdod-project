import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LocalPaymentAccount,
  LocalPaymentAccountDocument,
  PaymentAccountNumberingMode,
  PaymentAccountType,
  ProviderCurrencyAccount,
} from '../schemas/local-payment-account.schema';
import {
  CreateLocalPaymentAccountDto,
  UpdateLocalPaymentAccountDto,
  GroupedPaymentAccountDto,
  MediaReferenceDto,
} from '../dto/local-payment-account.dto';
import { Media } from '../../upload/schemas/media.schema';
import { DomainException, ErrorCode } from '../../../shared/exceptions';

const SUPPORTED_CURRENCIES = ['YER', 'SAR', 'USD'] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

type ProviderWithPopulatedMedia = LocalPaymentAccount & {
  _id: Types.ObjectId;
  iconMediaId?:
    | Types.ObjectId
    | (Media & { _id: Types.ObjectId | string })
    | string
    | null;
  accounts: Array<
    ProviderCurrencyAccount & {
      _id: Types.ObjectId;
    }
  >;
  createdAt: Date;
  updatedAt: Date;
};

interface ProviderAccountSummary {
  id: string;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  displayOrder: number;
  notes?: string;
  isOverride: boolean;
}

type NormalizedProviderCurrencyAccount = {
  _id?: Types.ObjectId;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  displayOrder: number;
  notes?: string;
};

export interface ProviderResponse {
  _id: string;
  providerName: string;
  iconMediaId?: string;
  icon?: MediaReferenceDto;
  type: PaymentAccountType;
  numberingMode: PaymentAccountNumberingMode;
  supportedCurrencies: string[];
  sharedAccountNumber?: string;
  accounts: ProviderAccountSummary[];
  isActive: boolean;
  notes?: string;
  displayOrder: number;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolvedAccountSelection {
  providerId: string;
  providerName: string;
  numberingMode: PaymentAccountNumberingMode;
  type: PaymentAccountType;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  icon?: MediaReferenceDto;
  iconMediaId?: string;
  displayOrder: number;
  notes?: string;
  shared: boolean;
}

type ProviderCurrencyAccountInput =
  | (ProviderCurrencyAccount & { _id?: Types.ObjectId })
  | {
      currency: string;
      accountNumber: string;
      isActive?: boolean;
      displayOrder?: number;
      notes?: string;
      _id?: Types.ObjectId | string;
    };

@Injectable()
export class LocalPaymentAccountService {
  constructor(
    @InjectModel(LocalPaymentAccount.name)
    private accountModel: Model<LocalPaymentAccountDocument>,
  ) {}

  async create(
    dto: CreateLocalPaymentAccountDto,
    userId: string,
  ): Promise<ProviderResponse> {
    const normalizedIconMediaId = this.normalizeIconMediaId(dto.iconMediaId);

    const prepared = this.preparePersistenceData({
      numberingMode: dto.numberingMode,
      accounts: dto.accounts,
      supportedCurrencies: dto.supportedCurrencies,
      sharedAccountNumber: dto.sharedAccountNumber,
      existingAccounts: [],
    });

    const account = new this.accountModel({
      providerName: dto.providerName,
      iconMediaId:
        normalizedIconMediaId !== undefined ? normalizedIconMediaId : undefined,
      type: dto.type,
      numberingMode: dto.numberingMode,
      supportedCurrencies: prepared.supportedCurrencies,
      sharedAccountNumber: prepared.sharedAccountNumber,
      accounts: this.toPersistenceAccounts(prepared.accounts),
      isActive: dto.isActive ?? true,
      notes: dto.notes,
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

    return this.enrichProviderWithMedia(
      populatedAccount.toObject() as ProviderWithPopulatedMedia,
    );
  }

  async findAll(activeOnly: boolean = false): Promise<ProviderResponse[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const accounts = await this.accountModel
      .find(filter)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1 })
      .lean<ProviderWithPopulatedMedia[]>();

    return accounts.map((account) => this.enrichProviderWithMedia(account));
  }

  async findGrouped(
    activeOnly: boolean = false,
  ): Promise<GroupedPaymentAccountDto[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const accounts = await this.accountModel
      .find(filter)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1 })
      .lean<ProviderWithPopulatedMedia[]>();

    const grouped: GroupedPaymentAccountDto[] = [];

    accounts.forEach((account) => {
      const provider = this.enrichProviderWithMedia(account);
      const dto = this.buildGroupedDto(provider, {
        activeOnly,
      });
      if (dto) {
        grouped.push(dto);
      }
    });

    return grouped;
  }

  async findByCurrency(
    currency: string,
    activeOnly: boolean = true,
  ): Promise<GroupedPaymentAccountDto[]> {
    const normalizedCurrency = currency.toUpperCase();
    const providers = await this.accountModel
      .find(activeOnly ? { isActive: true } : {})
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .sort({ providerName: 1, displayOrder: 1 })
      .lean<ProviderWithPopulatedMedia[]>();

    const grouped: GroupedPaymentAccountDto[] = [];
    providers.forEach((account) => {
      const provider = this.enrichProviderWithMedia(account);
      const dto = this.buildGroupedDto(provider, {
        activeOnly,
        currencyFilter: normalizedCurrency,
      });
      if (dto) {
        grouped.push(dto);
      }
    });

    return grouped;
  }

  async resolveAccountSelection(
    accountIdentifier: string,
    currency: string,
  ): Promise<ResolvedAccountSelection | null> {
    const parsed = this.parseAccountIdentifier(accountIdentifier);
    if (!parsed) {
      return null;
    }

    const normalizedCurrency = currency.toUpperCase();
    if (!this.isSupportedCurrency(normalizedCurrency)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        field: 'currency',
        reason: 'unsupported_currency',
      });
    }

    if (parsed.type === 'composite') {
      const providerDoc = await this.accountModel
        .findById(parsed.providerId)
        .populate({
          path: 'iconMediaId',
          match: { deletedAt: null },
        });

      if (!providerDoc) {
        return null;
      }

      const provider = this.enrichProviderWithMedia(
        providerDoc.toObject() as ProviderWithPopulatedMedia,
      );

      if (provider.numberingMode !== PaymentAccountNumberingMode.SHARED) {
        return null;
      }

      return this.buildSelectionFromProvider(provider, parsed.currency);
    }

    // parsed.type === 'objectId'
    const providerDoc = await this.accountModel
      .findById(parsed.id)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      });

    if (providerDoc) {
      const provider = this.enrichProviderWithMedia(
        providerDoc.toObject() as ProviderWithPopulatedMedia,
      );
      if (provider.numberingMode === PaymentAccountNumberingMode.SHARED) {
        return this.buildSelectionFromProvider(provider, normalizedCurrency);
      }
    }

    const accountDoc = await this.accountModel
      .findOne({ 'accounts._id': parsed.id })
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      });

    if (!accountDoc) {
      return null;
    }

    const provider = this.enrichProviderWithMedia(
      accountDoc.toObject() as ProviderWithPopulatedMedia,
    );

    const account = provider.accounts.find((item) => item.id === parsed.id);
    if (!account) {
      return null;
    }

    return {
      providerId: provider._id,
      providerName: provider.providerName,
      numberingMode: provider.numberingMode,
      type: provider.type,
      currency: account.currency,
      accountNumber: account.accountNumber,
      isActive: provider.isActive && account.isActive,
      icon: provider.icon,
      iconMediaId: provider.iconMediaId,
      displayOrder: account.displayOrder,
      notes: account.notes ?? provider.notes,
      shared: false,
    };
  }

  async update(
    id: string,
    dto: UpdateLocalPaymentAccountDto,
    userId: string,
  ): Promise<ProviderResponse> {
    const account = await this.accountModel
      .findById(id)
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      });

    if (!account) {
      throw new NotFoundException(
        `Local payment account with ID ${id} not found`,
      );
    }

    const targetNumberingMode =
      dto.numberingMode ?? account.numberingMode ?? PaymentAccountNumberingMode.PER_CURRENCY;

    const prepared = this.preparePersistenceData({
      numberingMode: targetNumberingMode,
      accounts: dto.accounts,
      supportedCurrencies: dto.supportedCurrencies,
      sharedAccountNumber: dto.sharedAccountNumber,
      existingAccounts: (account.accounts ?? []).map((item) => ({
        _id: (item as { _id?: Types.ObjectId })._id,
        currency: item.currency,
        accountNumber: item.accountNumber,
        isActive: item.isActive,
        displayOrder: item.displayOrder,
        notes: item.notes,
      })),
    });

    if (dto.providerName !== undefined) {
      account.providerName = dto.providerName;
    }

    if (dto.type !== undefined) {
      account.type = dto.type;
    }

    account.numberingMode = targetNumberingMode;
    account.supportedCurrencies = prepared.supportedCurrencies;
    account.sharedAccountNumber = prepared.sharedAccountNumber;
    account.accounts = this.toPersistenceAccounts(prepared.accounts);

    const normalizedIconMediaId = this.normalizeIconMediaId(dto.iconMediaId);
    if (dto.iconMediaId !== undefined) {
      account.iconMediaId = normalizedIconMediaId ?? undefined;
    }

    if (dto.isActive !== undefined) {
      account.isActive = dto.isActive;
    }

    if (dto.notes !== undefined) {
      account.notes = dto.notes;
    }

    if (dto.displayOrder !== undefined) {
      account.displayOrder = dto.displayOrder;
    }

    account.updatedBy = userId;

    await account.save();

    const populatedAccount = await account
      .populate({
        path: 'iconMediaId',
        match: { deletedAt: null },
      })
      .catch(() => account);

    return this.enrichProviderWithMedia(
      populatedAccount.toObject() as ProviderWithPopulatedMedia,
    );
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.findByIdAndDelete(id);
  }

  async getProviderNames(): Promise<string[]> {
    const providers = await this.accountModel.distinct('providerName');
    return providers.sort();
  }

  private enrichProviderWithMedia(
    provider: ProviderWithPopulatedMedia,
  ): ProviderResponse {
    let icon: MediaReferenceDto | undefined;
    let iconMediaId: string | undefined;

    if (this.isPopulatedMedia(provider.iconMediaId)) {
      const resolvedId =
        provider.iconMediaId._id instanceof Types.ObjectId
          ? provider.iconMediaId._id.toString()
          : provider.iconMediaId._id;
      iconMediaId = resolvedId;
      icon = {
        id: resolvedId,
        url: provider.iconMediaId.url,
        name: provider.iconMediaId.name,
      };
    } else if (provider.iconMediaId instanceof Types.ObjectId) {
      iconMediaId = provider.iconMediaId.toString();
    } else if (typeof provider.iconMediaId === 'string') {
      iconMediaId = provider.iconMediaId;
    }

    const accounts: ProviderAccountSummary[] = (provider.accounts ?? []).map(
      (item) => {
        const rawId = (item as { _id?: Types.ObjectId })._id;
        return {
          id: rawId ? rawId.toString() : new Types.ObjectId().toString(),
          currency: item.currency,
          accountNumber: item.accountNumber,
          isActive: item.isActive,
          displayOrder: item.displayOrder ?? 0,
          notes: item.notes,
          isOverride:
            provider.numberingMode === PaymentAccountNumberingMode.SHARED,
        };
      },
    );

    const supportedCurrencies =
      provider.supportedCurrencies?.length
        ? this.normalizeCurrencyList(provider.supportedCurrencies)
        : this.normalizeCurrencyList(accounts.map((item) => item.currency));

    return {
      _id: provider._id.toString(),
      providerName: provider.providerName,
      iconMediaId,
      icon,
      type: provider.type,
      numberingMode: provider.numberingMode,
      supportedCurrencies,
      sharedAccountNumber: provider.sharedAccountNumber ?? undefined,
      accounts,
      isActive: provider.isActive,
      notes: provider.notes,
      displayOrder: provider.displayOrder ?? 0,
      updatedBy: provider.updatedBy,
      createdAt: provider.createdAt!,
      updatedAt: provider.updatedAt!,
    };
  }

  private buildGroupedDto(
    provider: ProviderResponse,
    options: {
      activeOnly: boolean;
      currencyFilter?: string;
    },
  ): GroupedPaymentAccountDto | null {
    const targetCurrency = options.currencyFilter;
    const accounts: GroupedPaymentAccountDto['accounts'] = [];

    if (
      options.activeOnly &&
      !provider.isActive &&
      provider.numberingMode === PaymentAccountNumberingMode.SHARED
    ) {
      return null;
    }

    if (provider.numberingMode === PaymentAccountNumberingMode.PER_CURRENCY) {
      let accountList = provider.accounts;
      if (options.activeOnly) {
        accountList = accountList.filter((item) => item.isActive && provider.isActive);
      }

      if (targetCurrency) {
        accountList = accountList.filter(
          (item) => item.currency === targetCurrency,
        );
      }

      if (!accountList.length) {
        return null;
      }

      accountList
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder ||
            a.currency.localeCompare(b.currency),
        )
        .forEach((item) => {
          accounts.push({
            id: item.id,
            currency: item.currency,
            accountNumber: item.accountNumber,
            isActive: provider.isActive && item.isActive,
            displayOrder: item.displayOrder,
            notes: item.notes,
          });
        });

      return {
        providerId: provider._id,
        providerName: provider.providerName,
        icon: provider.icon,
        type: provider.type,
        numberingMode: provider.numberingMode,
        supportedCurrencies: Array.from(
          new Set(accountList.map((item) => item.currency)),
        ),
        sharedAccountNumber: undefined,
        accounts,
      };
    }

    const supported = provider.supportedCurrencies.length
      ? provider.supportedCurrencies
      : Array.from(
          new Set(provider.accounts.map((item) => item.currency)),
        ).sort((a, b) => a.localeCompare(b));
    const overridesByCurrency = new Map(
      provider.accounts.map((item) => [item.currency, item]),
    );
    const candidateCurrencies = targetCurrency
      ? supported.includes(targetCurrency)
        ? [targetCurrency]
        : overridesByCurrency.has(targetCurrency)
        ? [targetCurrency]
        : []
      : supported;

    candidateCurrencies.forEach((currency) => {
      const override = overridesByCurrency.get(currency);
      if (override) {
        if (!options.activeOnly || (provider.isActive && override.isActive)) {
          accounts.push({
            id: override.id,
            currency,
            accountNumber: override.accountNumber,
            isActive: provider.isActive && override.isActive,
            displayOrder: override.displayOrder,
            notes: override.notes,
          });
        }
        return;
      }

      if (!provider.sharedAccountNumber) {
        return;
      }

      if (options.activeOnly && !provider.isActive) {
        return;
      }

      accounts.push({
        id: this.composeSharedAccountId(provider._id, currency),
        currency,
        accountNumber: provider.sharedAccountNumber,
        isActive: provider.isActive,
        displayOrder: provider.displayOrder,
        notes: provider.notes,
      });
    });

    if (!accounts.length) {
      return null;
    }

    accounts.sort(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.currency.localeCompare(b.currency),
    );

    return {
      providerId: provider._id,
      providerName: provider.providerName,
      icon: provider.icon,
      type: provider.type,
      numberingMode: provider.numberingMode,
      supportedCurrencies: supported,
      sharedAccountNumber: provider.sharedAccountNumber,
      accounts,
    };
  }

  private buildSelectionFromProvider(
    provider: ProviderResponse,
    currency: string,
  ): ResolvedAccountSelection | null {
    const normalizedCurrency = currency.toUpperCase();
    const overridesByCurrency = new Map(
      provider.accounts.map((item) => [item.currency, item]),
    );
    const override = overridesByCurrency.get(normalizedCurrency);
    const supported = provider.supportedCurrencies.includes(normalizedCurrency);
    if (!override && !supported) {
      return null;
    }

    const accountNumber =
      override?.accountNumber ?? provider.sharedAccountNumber;
    if (!accountNumber) {
      return null;
    }

    const isActive =
      provider.isActive && (override ? override.isActive : true);

    return {
      providerId: provider._id,
      providerName: provider.providerName,
      numberingMode: provider.numberingMode,
      type: provider.type,
      currency: normalizedCurrency,
      accountNumber,
      isActive,
      icon: provider.icon,
      iconMediaId: provider.iconMediaId,
      displayOrder: override?.displayOrder ?? provider.displayOrder,
      notes: override?.notes ?? provider.notes,
      shared: !override,
    };
  }

  private preparePersistenceData(params: {
    numberingMode: PaymentAccountNumberingMode;
    accounts?: ProviderCurrencyAccountInput[];
    supportedCurrencies?: string[];
    sharedAccountNumber?: string;
  existingAccounts: ProviderCurrencyAccountInput[];
  }): {
  accounts: NormalizedProviderCurrencyAccount[];
    supportedCurrencies: string[];
    sharedAccountNumber?: string;
  } {
    if (params.numberingMode === PaymentAccountNumberingMode.SHARED) {
      const sharedAccountNumber = params.sharedAccountNumber?.trim();
      if (!sharedAccountNumber) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, {
          field: 'sharedAccountNumber',
          reason: 'required_for_shared_mode',
        });
      }

      const currencies = this.normalizeCurrencyList(
        params.supportedCurrencies?.length
          ? params.supportedCurrencies
          : params.existingAccounts.map((item) => item.currency),
      );

      if (!currencies.length) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, {
          field: 'supportedCurrencies',
          reason: 'at_least_one_currency_required',
        });
      }

      const overridesSource =
        params.accounts ?? params.existingAccounts ?? [];
      const overrides = overridesSource.map((account) =>
        this.normalizeAccountInput(account),
      );

      const duplicates = new Set<string>();
      overrides.forEach((account) => {
        if (!currencies.includes(account.currency)) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            field: 'accounts',
            reason: 'currency_not_supported',
            currency: account.currency,
          });
        }
        if (duplicates.has(account.currency)) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            field: 'accounts',
            reason: 'duplicate_currency',
            currency: account.currency,
          });
        }
        duplicates.add(account.currency);
      });

      return {
        accounts: overrides,
        supportedCurrencies: currencies,
        sharedAccountNumber,
      };
    }

    const accountsSource =
      params.accounts ?? params.existingAccounts ?? [];

    if (!accountsSource.length) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        field: 'accounts',
        reason: 'at_least_one_account_required',
      });
    }

    const accounts = accountsSource.map((account) =>
      this.normalizeAccountInput(account),
    );

    const duplicates = new Set<string>();
    accounts.forEach((account) => {
      if (duplicates.has(account.currency)) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, {
          field: 'accounts',
          reason: 'duplicate_currency',
          currency: account.currency,
        });
      }
      duplicates.add(account.currency);
    });

    const supportedCurrencies = Array.from(duplicates).sort((a, b) =>
      a.localeCompare(b),
    );

    return {
      accounts,
      supportedCurrencies,
    };
  }

  private normalizeAccountInput(
    account: ProviderCurrencyAccountInput,
  ): NormalizedProviderCurrencyAccount {
    const normalizedCurrency = account.currency.toUpperCase();
    if (!this.isSupportedCurrency(normalizedCurrency)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        field: 'currency',
        reason: 'unsupported_currency',
        currency: account.currency,
      });
    }

    const normalized: NormalizedProviderCurrencyAccount = {
      currency: normalizedCurrency,
      accountNumber: account.accountNumber,
      isActive: account.isActive ?? true,
      displayOrder: account.displayOrder ?? 0,
      notes: account.notes,
    };

    if (account._id) {
      normalized._id =
        account._id instanceof Types.ObjectId
          ? account._id
          : new Types.ObjectId(account._id);
    }

    return normalized;
  }

  private parseAccountIdentifier(
    identifier: string,
  ):
    | { type: 'composite'; providerId: string; currency: string }
    | { type: 'objectId'; id: string }
    | null {
    if (identifier.includes(':')) {
      const [providerId, currency] = identifier.split(':');
      if (
        Types.ObjectId.isValid(providerId) &&
        currency &&
        this.isSupportedCurrency(currency.toUpperCase())
      ) {
        return {
          type: 'composite',
          providerId,
          currency: currency.toUpperCase(),
        };
      }
      return null;
    }

    if (Types.ObjectId.isValid(identifier)) {
      return { type: 'objectId', id: identifier };
    }

    return null;
  }

  private composeSharedAccountId(
    providerId: string,
    currency: string,
  ): string {
    return `${providerId}:${currency.toUpperCase()}`;
  }

  private normalizeCurrencyList(currencies: string[] | undefined): string[] {
    if (!currencies?.length) {
      return [];
    }

    const normalized = currencies
      .map((currency) => currency?.toUpperCase())
      .filter((currency): currency is string =>
        this.isSupportedCurrency(currency),
      );

    return Array.from(new Set(normalized)).sort((a, b) =>
      a.localeCompare(b),
    );
  }

  private toPersistenceAccounts(
    accounts: NormalizedProviderCurrencyAccount[],
  ): ProviderCurrencyAccount[] {
    return accounts.map((account) => ({
      ...(account._id ? { _id: account._id } : {}),
      currency: account.currency,
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      displayOrder: account.displayOrder,
      notes: account.notes,
    })) as ProviderCurrencyAccount[];
  }

  private isSupportedCurrency(currency: string): currency is SupportedCurrency {
    return (SUPPORTED_CURRENCIES as readonly string[]).includes(currency);
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

  private normalizeIconMediaId(
    iconMediaId?: string | null,
  ): Types.ObjectId | null | undefined {
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

