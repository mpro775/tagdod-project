function isGsm7(text: string): boolean {
  return !/[\u0600-\u06FF]/.test(text);
}

export function calculateSmsSegments(message: string): {
  encoding: 'GSM_7' | 'UCS_2';
  length: number;
  segments: number;
} {
  const length = message?.length || 0;
  const encoding = isGsm7(message) ? 'GSM_7' : 'UCS_2';

  if (encoding === 'GSM_7') {
    return { encoding, length, segments: length <= 160 ? 1 : Math.ceil(length / 153) };
  }

  return { encoding, length, segments: length <= 70 ? 1 : Math.ceil(length / 67) };
}
