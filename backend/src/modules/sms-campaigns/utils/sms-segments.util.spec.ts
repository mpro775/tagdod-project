import { calculateSmsSegments } from './sms-segments.util';

describe('calculateSmsSegments', () => {
  it('uses GSM_7 limits for non-Arabic text', () => {
    expect(calculateSmsSegments('hello')).toEqual({
      encoding: 'GSM_7',
      length: 5,
      segments: 1,
    });
    expect(calculateSmsSegments('a'.repeat(161))).toMatchObject({
      encoding: 'GSM_7',
      segments: 2,
    });
  });

  it('uses UCS_2 limits for Arabic text', () => {
    expect(calculateSmsSegments('مرحبا')).toEqual({
      encoding: 'UCS_2',
      length: 5,
      segments: 1,
    });
    expect(calculateSmsSegments('م'.repeat(71))).toMatchObject({
      encoding: 'UCS_2',
      segments: 2,
    });
  });
});
