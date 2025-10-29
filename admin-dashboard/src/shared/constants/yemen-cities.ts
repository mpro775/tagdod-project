/**
 * قائمة المدن اليمنية
 * Yemen Cities List
 */
export const YEMEN_CITIES = [
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'المكلا', label: 'المكلا' },
  { value: 'حجة', label: 'حجة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'سيئون', label: 'سيئون' },
  { value: 'زنجبار', label: 'زنجبار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الجوف', label: 'الجوف' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'سقطرى', label: 'سقطرى' },
] as const;

/**
 * المدينة الافتراضية
 */
export const DEFAULT_CITY = 'صنعاء';

/**
 * أسماء المدن فقط (للتحقق)
 */
export const CITY_NAMES = YEMEN_CITIES.map(city => city.value);

