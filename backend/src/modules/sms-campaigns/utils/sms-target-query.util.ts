import { FilterQuery, Types } from 'mongoose';
import {
  CapabilityStatus,
  User,
  UserRole,
  UserStatus,
} from '../../users/schemas/user.schema';
import { SmsCampaignTarget } from '../sms-campaign.constants';

interface TargetQueryInput {
  target: SmsCampaignTarget;
  filters?: { city?: string };
  customUserIds?: string[];
}

export function buildTargetQuery(input: TargetQueryInput): FilterQuery<User> {
  const query: FilterQuery<User> = {
    deletedAt: null,
    status: UserStatus.ACTIVE,
    phone: { $exists: true, $ne: '' },
  };

  if (input.filters?.city) {
    query.city = input.filters.city;
  }

  switch (input.target) {
    case SmsCampaignTarget.CUSTOMERS:
      query.customer_capable = true;
      break;
    case SmsCampaignTarget.ENGINEERS:
      query.engineer_capable = true;
      query.engineer_status = CapabilityStatus.APPROVED;
      break;
    case SmsCampaignTarget.MERCHANTS:
      query.merchant_capable = true;
      query.merchant_status = CapabilityStatus.APPROVED;
      break;
    case SmsCampaignTarget.ADMINS:
      query.roles = { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
      break;
    case SmsCampaignTarget.CUSTOM:
      query._id = {
        $in: (input.customUserIds || [])
          .filter((id) => Types.ObjectId.isValid(id))
          .map((id) => new Types.ObjectId(id)),
      };
      break;
    case SmsCampaignTarget.ALL:
    default:
      break;
  }

  return query;
}
