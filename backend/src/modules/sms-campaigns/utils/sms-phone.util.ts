const VALID_YEMEN_PREFIXES = ['70', '71', '73', '77', '78'];

export function normalizeYemeniPhone(phone: string): {
  valid: boolean;
  normalized?: string;
  reason?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, reason: 'EMPTY_PHONE' };
  }

  let digits = phone.replace(/[^0-9]/g, '');

  if (digits.startsWith('00967')) digits = digits.slice(2);
  if (digits.startsWith('967')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length !== 9) {
    return { valid: false, reason: 'INVALID_LENGTH' };
  }

  const prefix = digits.slice(0, 2);
  if (!VALID_YEMEN_PREFIXES.includes(prefix)) {
    return { valid: false, reason: 'INVALID_YEMEN_PREFIX' };
  }

  return { valid: true, normalized: `+967${digits}` };
}
