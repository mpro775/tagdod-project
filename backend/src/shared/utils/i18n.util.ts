/**
 * Helper function لإرجاع النص حسب اللغة
 */
export function getLocalizedField(
  obj: Record<string, unknown>,
  field: string,
  lang: 'ar' | 'en' = 'ar',
): string {
  const enKey = `${field}En`;
  const enVal = obj[enKey];
  const baseVal = obj[field];

  if (lang === 'en' && typeof enVal === 'string' && enVal) return enVal;
  if (typeof baseVal === 'string' && baseVal) return baseVal;
  if (typeof enVal === 'string') return enVal;
  return '';
}

/**
 * Helper function لتحويل object إلى النسخة المترجمة
 */
export function localizeObject(
  obj: Record<string, unknown> | null | undefined,
  lang: 'ar' | 'en' = 'ar',
): Record<string, unknown> | null | undefined {
  if (!obj) return obj;

  const localized: Record<string, unknown> = { ...obj };

  // الحقول الشائعة
  const fieldsToLocalize = ['name', 'description', 'title', 'value'];

  fieldsToLocalize.forEach((field) => {
    if (obj[field] !== undefined || obj[`${field}En`] !== undefined) {
      localized[field] = getLocalizedField(obj, field, lang);
    }
  });

  return localized;
}

/**
 * Helper function لترجمة array من objects
 */
export function localizeArray(
  arr: Array<Record<string, unknown>>, 
  lang: 'ar' | 'en' = 'ar',
): Array<Record<string, unknown>> {
  return arr.map((item) => localizeObject(item, lang) as Record<string, unknown>);
}
