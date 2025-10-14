/**
 * Helper function لإرجاع النص حسب اللغة
 */
export function getLocalizedField(obj: any, field: string, lang: 'ar' | 'en' = 'ar'): string {
  if (lang === 'en' && obj[`${field}En`]) {
    return obj[`${field}En`];
  }
  return obj[field] || obj[`${field}En`] || '';
}

/**
 * Helper function لتحويل object إلى النسخة المترجمة
 */
export function localizeObject(obj: any, lang: 'ar' | 'en' = 'ar'): any {
  if (!obj) return obj;
  
  const localized: any = { ...obj };
  
  // الحقول الشائعة
  const fieldsToLocalize = ['name', 'description', 'title', 'value'];
  
  fieldsToLocalize.forEach(field => {
    if (obj[field] !== undefined || obj[`${field}En`] !== undefined) {
      localized[field] = getLocalizedField(obj, field, lang);
    }
  });
  
  return localized;
}

/**
 * Helper function لترجمة array من objects
 */
export function localizeArray(arr: any[], lang: 'ar' | 'en' = 'ar'): any[] {
  return arr.map(item => localizeObject(item, lang));
}

