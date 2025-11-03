import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  LocalPaymentAccount, 
  LocalPaymentAccountDocument 
} from '../schemas/local-payment-account.schema';
import { 
  CreateLocalPaymentAccountDto, 
  UpdateLocalPaymentAccountDto, 
  GroupedPaymentAccountDto 
} from '../dto/local-payment-account.dto';

@Injectable()
export class LocalPaymentAccountService {
  constructor(
    @InjectModel(LocalPaymentAccount.name)
    private accountModel: Model<LocalPaymentAccountDocument>,
  ) {}

  async create(dto: CreateLocalPaymentAccountDto, userId: string): Promise<LocalPaymentAccount> {
    const account = new this.accountModel({
      ...dto,
      isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder ?? 0,
      updatedBy: userId,
    });
    return account.save();
  }

  async findAll(activeOnly: boolean = false): Promise<LocalPaymentAccount[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.accountModel.find(filter)
      .sort({ providerName: 1, displayOrder: 1, currency: 1 })
      .lean();
  }

  async findGrouped(activeOnly: boolean = false): Promise<GroupedPaymentAccountDto[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const accounts = await this.accountModel.find(filter)
      .sort({ providerName: 1, displayOrder: 1, currency: 1 })
      .lean();

    // تجميع الحسابات حسب providerName
    const grouped = new Map<string, GroupedPaymentAccountDto>();

    accounts.forEach(account => {
      if (!grouped.has(account.providerName)) {
        grouped.set(account.providerName, {
          providerName: account.providerName,
          iconUrl: account.iconUrl,
          type: account.type,
          accounts: [],
        });
      }

      const group = grouped.get(account.providerName)!;
      group.accounts.push({
        id: account._id.toString(),
        accountNumber: account.accountNumber,
        currency: account.currency,
        isActive: account.isActive,
        displayOrder: account.displayOrder,
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
      .sort({ providerName: 1, displayOrder: 1 })
      .lean();

    // تجميع حسب providerName
    const grouped = new Map<string, GroupedPaymentAccountDto>();

    accounts.forEach(account => {
      if (!grouped.has(account.providerName)) {
        grouped.set(account.providerName, {
          providerName: account.providerName,
          iconUrl: account.iconUrl,
          type: account.type,
          accounts: [],
        });
      }

      const group = grouped.get(account.providerName)!;
      group.accounts.push({
        id: account._id.toString(),
        accountNumber: account.accountNumber,
        currency: account.currency,
        isActive: account.isActive,
        displayOrder: account.displayOrder,
      });
    });

    return Array.from(grouped.values());
  }

  async findById(id: string): Promise<LocalPaymentAccount | null> {
    return this.accountModel.findById(id);
  }

  async update(id: string, dto: UpdateLocalPaymentAccountDto, userId: string): Promise<LocalPaymentAccount> {
    const account = await this.accountModel.findByIdAndUpdate(
      id,
      { ...dto, updatedBy: userId },
      { new: true }
    );
    
    if (!account) {
      throw new NotFoundException(`Local payment account with ID ${id} not found`);
    }
    
    return account;
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.findByIdAndDelete(id);
  }

  async getProviderNames(): Promise<string[]> {
    const providers = await this.accountModel.distinct('providerName');
    return providers.sort();
  }
}

