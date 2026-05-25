import { normalizeYemeniPhone } from './sms-phone.util';

describe('normalizeYemeniPhone', () => {
  it.each([
    ['777123456', '+967777123456'],
    ['0777123456', '+967777123456'],
    ['967777123456', '+967777123456'],
    ['+967777123456', '+967777123456'],
    ['00967777123456', '+967777123456'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeYemeniPhone(input)).toEqual({ valid: true, normalized: expected });
  });

  it('rejects invalid length', () => {
    expect(normalizeYemeniPhone('123')).toMatchObject({
      valid: false,
      reason: 'INVALID_LENGTH',
    });
  });

  it('rejects invalid Yemeni mobile prefix', () => {
    expect(normalizeYemeniPhone('967111111111')).toMatchObject({
      valid: false,
      reason: 'INVALID_YEMEN_PREFIX',
    });
  });
});
