/**
 * ترجمة رسائل خطأ الـ API للعربية (لإنشاء القوالب)
 */
const VALIDATION_MESSAGES_AR: Record<string, string> = {
  'property id should not exist': 'الحقل id غير مسموح',
  'key must be shorter than or equal to 100 characters': 'المفتاح يجب أن يكون 100 حرف أو أقل',
  'key must be a string': 'المفتاح يجب أن يكون نصاً',
  'title must be shorter than or equal to 200 characters': 'العنوان يجب أن يكون 200 حرف أو أقل',
  'title must be a string': 'العنوان يجب أن يكون نصاً',
  'message must be shorter than or equal to 1000 characters': 'المحتوى يجب أن يكون 1000 حرف أو أقل',
  'message must be a string': 'المحتوى يجب أن يكون نصاً',
  'messageEn must be shorter than or equal to 1000 characters':
    'المحتوى (إنجليزي) يجب أن يكون 1000 حرف أو أقل',
  'messageEn must be a string': 'المحتوى (إنجليزي) يجب أن يكون نصاً',
  'type must be a string': 'النوع يجب أن يكون نصاً',
  'key should not be empty': 'المفتاح مطلوب',
  'title should not be empty': 'العنوان مطلوب',
  'message should not be empty': 'المحتوى مطلوب',
  'messageEn should not be empty': 'المحتوى (إنجليزي) مطلوب',
  'type should not be empty': 'النوع مطلوب',
};

export function translateApiValidationErrors(message: string | string[]): string {
  const messages = Array.isArray(message) ? message : [message];
  const translated = messages.map((m) => VALIDATION_MESSAGES_AR[m] || m);
  return translated.join('\n');
}
