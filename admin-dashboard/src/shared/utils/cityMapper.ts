import { YEMEN_CITIES, DEFAULT_CITY } from '@/shared/constants/yemen-cities';

/**
 * Mapping from common English city names to Arabic names
 */
const ENGLISH_TO_ARABIC_CITY_MAP: Record<string, string> = {
  "Sana'a": 'صنعاء',
  "Sanaa": 'صنعاء',
  "Sana": 'صنعاء',
  "Aden": 'عدن',
  "Taiz": 'تعز',
  "Taizz": 'تعز',
  "Hodeidah": 'الحديدة',
  "Al Hudaydah": 'الحديدة',
  "Ibb": 'إب',
  "Dhamar": 'ذمار',
  "Mukalla": 'المكلا',
  "Al Mukalla": 'المكلا',
  "Hajjah": 'حجة',
  "Amran": 'عمران',
  "Saada": 'صعدة',
  "Sadaa": 'صعدة',
  "Seiyun": 'سيئون',
  "Sayun": 'سيئون',
  "Zinjibar": 'زنجبار',
  "Marib": 'مأرب',
  "Ma'rib": 'مأرب',
  "Bayda": 'البيضاء',
  "Al Bayda": 'البيضاء',
  "Lahij": 'لحج',
  "Lahej": 'لحج',
  "Abyan": 'أبين',
  "Shabwah": 'شبوة',
  "Shabwa": 'شبوة',
  "Mahwit": 'المحويت',
  "Al Mahwit": 'المحويت',
  "Hadramout": 'حضرموت',
  "Hadramaut": 'حضرموت',
  "Jawf": 'الجوف',
  "Al Jawf": 'الجوف',
  "Mahra": 'المهرة',
  "Al Mahra": 'المهرة',
  "Socotra": 'سقطرى',
  "Socotra Island": 'سقطرى',
};

/**
 * Map an English city name to Arabic, or return the city if it's already Arabic or valid
 */
export function mapCityToArabic(city: string | undefined | null): string {
  if (!city) {
    return DEFAULT_CITY;
  }

  // Check if it's already a valid Arabic city
  const validArabicCities = YEMEN_CITIES.map((c) => c.value) as readonly string[];
  if (validArabicCities.includes(city)) {
    return city;
  }

  // Try to map from English to Arabic
  const mapped = ENGLISH_TO_ARABIC_CITY_MAP[city] || ENGLISH_TO_ARABIC_CITY_MAP[city.trim()];
  if (mapped) {
    return mapped;
  }

  // If no mapping found, try case-insensitive match
  const lowerCity = city.toLowerCase().trim();
  for (const [english, arabic] of Object.entries(ENGLISH_TO_ARABIC_CITY_MAP)) {
    if (english.toLowerCase() === lowerCity) {
      return arabic;
    }
  }

  // If still no match, return default city
  return DEFAULT_CITY;
}

