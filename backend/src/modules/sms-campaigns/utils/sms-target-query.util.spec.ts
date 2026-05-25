import { CapabilityStatus, UserRole, UserStatus } from '../../users/schemas/user.schema';
import { SmsCampaignTarget } from '../sms-campaign.constants';
import { buildTargetQuery } from './sms-target-query.util';

describe('buildTargetQuery', () => {
  it('builds the base active users query', () => {
    expect(buildTargetQuery({ target: SmsCampaignTarget.ALL })).toMatchObject({
      deletedAt: null,
      status: UserStatus.ACTIVE,
      phone: { $exists: true, $ne: '' },
    });
  });

  it('builds customer targeting with city filter', () => {
    expect(
      buildTargetQuery({
        target: SmsCampaignTarget.CUSTOMERS,
        filters: { city: 'Sanaa' },
      }),
    ).toMatchObject({
      customer_capable: true,
      city: 'Sanaa',
    });
  });

  it('builds approved engineer targeting', () => {
    expect(buildTargetQuery({ target: SmsCampaignTarget.ENGINEERS })).toMatchObject({
      engineer_capable: true,
      engineer_status: CapabilityStatus.APPROVED,
    });
  });

  it('builds approved merchant targeting', () => {
    expect(buildTargetQuery({ target: SmsCampaignTarget.MERCHANTS })).toMatchObject({
      merchant_capable: true,
      merchant_status: CapabilityStatus.APPROVED,
    });
  });

  it('builds admin targeting', () => {
    expect(buildTargetQuery({ target: SmsCampaignTarget.ADMINS })).toMatchObject({
      roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    });
  });
});
