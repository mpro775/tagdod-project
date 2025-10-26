/**
 * قائمة المدن اليمنية
 * Yemeni Cities Enum
 */
export enum YemeniCity {
  SANAA = 'صنعاء',
  ADEN = 'عدن',
  TAIZ = 'تعز',
  HODEIDAH = 'الحديدة',
  IBB = 'إب',
  DHAMAR = 'ذمار',
  MUKALLA = 'المكلا',
  HAJJAH = 'حجة',
  AMRAN = 'عمران',
  SAADA = 'صعدة',
  SEIYUN = 'سيئون',
  ZINJIBAR = 'زنجبار',
  MARIB = 'مأرب',
  BAYDA = 'البيضاء',
  LAHIJ = 'لحج',
  ABYAN = 'أبين',
  SHABWAH = 'شبوة',
  MAHWIT = 'المحويت',
  HADRAMOUT = 'حضرموت',
  JAWF = 'الجوف',
  MAHRA = 'المهرة',
  SOCOTRA = 'سقطرى',
}

/**
 * قائمة المدن كمصفوفة
 */
export const YEMENI_CITIES = Object.values(YemeniCity);

/**
 * المدينة الافتراضية
 */
export const DEFAULT_CITY = YemeniCity.SANAA;

/**
 * خريطة المدن مع الأكواد الإنجليزية
 */
export const CITY_CODE_MAP: Record<string, YemeniCity> = {
  SANAA: YemeniCity.SANAA,
  ADEN: YemeniCity.ADEN,
  TAIZ: YemeniCity.TAIZ,
  HODEIDAH: YemeniCity.HODEIDAH,
  IBB: YemeniCity.IBB,
  DHAMAR: YemeniCity.DHAMAR,
  MUKALLA: YemeniCity.MUKALLA,
  HAJJAH: YemeniCity.HAJJAH,
  AMRAN: YemeniCity.AMRAN,
  SAADA: YemeniCity.SAADA,
  SEIYUN: YemeniCity.SEIYUN,
  ZINJIBAR: YemeniCity.ZINJIBAR,
  MARIB: YemeniCity.MARIB,
  BAYDA: YemeniCity.BAYDA,
  LAHIJ: YemeniCity.LAHIJ,
  ABYAN: YemeniCity.ABYAN,
  SHABWAH: YemeniCity.SHABWAH,
  MAHWIT: YemeniCity.MAHWIT,
  HADRAMOUT: YemeniCity.HADRAMOUT,
  JAWF: YemeniCity.JAWF,
  MAHRA: YemeniCity.MAHRA,
  SOCOTRA: YemeniCity.SOCOTRA,
};

/**
 * التحقق من صحة المدينة
 */
export function isValidCity(city: string): boolean {
  return YEMENI_CITIES.includes(city as YemeniCity);
}

/**
 * الحصول على كود المدينة من الاسم
 */
export function getCityCode(cityName: YemeniCity): string | null {
  const entry = Object.entries(CITY_CODE_MAP).find(([_, value]) => value === cityName);
  return entry ? entry[0] : null;
}

