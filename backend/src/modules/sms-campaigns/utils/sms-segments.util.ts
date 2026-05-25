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
    if (length <= 160) return { encoding, length, segments: 1 };
    return { encoding, length, segments: Math.ceil(length / 153) };
  }

  if (length <= 70) return { encoding, length, segments: 1 };
  return { encoding, length, segments: Math.ceil(length / 67) };
}
