import { OrderService } from './order.service';
import { DomainException } from '../../../shared/exceptions';

describe('OrderService checkout coupon session fallback', () => {
  const userId = '690cad427d38ae5099f364fa';

  const makeService = () => {
    const service = new (OrderService as any)(...Array(23).fill({}));
    (service as any).addressesService = {
      validateAddressOwnership: jest.fn().mockResolvedValue(true),
      getAddressById: jest.fn().mockResolvedValue({
        _id: '691b03649ff0cdeb68420949',
        label: 'Home',
        line1: 'Street',
        city: 'Sanaa',
        coords: { lat: 15.34, lng: 44.19 },
      }),
    };
    (service as any).checkCODEligibility = jest.fn().mockResolvedValue({
      eligible: true,
      requiredOrders: 0,
      remainingOrders: 0,
      totalOrders: 1,
      completedOrders: 1,
      inProgressOrders: 0,
      cancelledOrders: 0,
      progress: '1/0',
    });

    return service as any;
  };

  const makeDto = () =>
    ({
      deliveryAddressId: '691b03649ff0cdeb68420949',
      currency: 'USD',
      paymentMethod: 'BANK_TRANSFER',
      paymentProvider: '6953a2c330562a2a250a30bd',
      localPaymentAccountId: '6953a2c330562a2a250a30bd:USD',
      paymentReference: '0101112212',
    }) as any;

  it('reuses the last applied checkout-session coupon when confirm omits coupon codes', async () => {
    const service = makeService();
    const stop = new Error('stop-after-preview-call');

    service.rememberCheckoutCouponSession({
      userId,
      requestedCodes: ['MAY1'],
      appliedCodes: ['MAY1'],
      source: 'session',
    });

    service.previewCheckout = jest.fn().mockImplementation(async () => {
      throw stop;
    });

    await expect(service.confirmCheckout(userId, makeDto())).rejects.toThrow();

    expect(service.previewCheckout).toHaveBeenCalledWith(userId, 'USD', 'MAY1', ['MAY1']);
  });

  it('fails validation if a fallback coupon no longer applies during confirm', async () => {
    const service = makeService();

    service.rememberCheckoutCouponSession({
      userId,
      requestedCodes: ['MAY1'],
      appliedCodes: ['MAY1'],
      source: 'session',
    });

    service.previewCheckout = jest.fn().mockResolvedValue({
      data: {
        total: 5.7,
        subtotal: 5.7,
        shipping: 0,
        couponDiscount: 0,
        discounts: {
          itemsDiscount: 0,
          couponDiscount: 0,
          totalDiscount: 0,
          appliedCoupons: [],
        },
        items: [],
      },
    });

    await expect(service.confirmCheckout(userId, makeDto())).rejects.toBeInstanceOf(
      DomainException,
    );
  });

  it('does not invent a coupon when there is no request coupon and no cached session', async () => {
    const service = makeService();
    const stop = new Error('stop-after-preview-call');

    service.previewCheckout = jest.fn().mockImplementation(async () => {
      throw stop;
    });

    await expect(service.confirmCheckout(userId, makeDto())).rejects.toThrow();

    expect(service.previewCheckout).toHaveBeenCalledWith(userId, 'USD', undefined, []);
  });
});
