/// ملف Constants للمدن اليمنية
/// يُستخدم في تطبيق Flutter للخدمات
/// 
/// Path: lib/constants/yemeni_cities.dart

class YemeniCities {
  // منع الإنشاء
  YemeniCities._();

  /// المدن اليمنية المدعومة
  static const String SANAA = 'صنعاء';
  static const String ADEN = 'عدن';
  static const String TAIZ = 'تعز';
  static const String HODEIDAH = 'الحديدة';
  static const String IBB = 'إب';
  static const String DHAMAR = 'ذمار';
  static const String MUKALLA = 'المكلا';
  static const String HAJJAH = 'حجة';
  static const String AMRAN = 'عمران';
  static const String SAADA = 'صعدة';
  static const String SEIYUN = 'سيئون';
  static const String ZINJIBAR = 'زنجبار';
  static const String MARIB = 'مأرب';
  static const String BAYDA = 'البيضاء';
  static const String LAHIJ = 'لحج';
  static const String ABYAN = 'أبين';
  static const String SHABWAH = 'شبوة';
  static const String MAHWIT = 'المحويت';
  static const String HADRAMOUT = 'حضرموت';
  static const String JAWF = 'الجوف';
  static const String MAHRA = 'المهرة';
  static const String SOCOTRA = 'سقطرى';

  /// المدينة الافتراضية
  static const String DEFAULT_CITY = SANAA;

  /// قائمة جميع المدن
  static const List<String> ALL_CITIES = [
    SANAA,
    ADEN,
    TAIZ,
    HODEIDAH,
    IBB,
    DHAMAR,
    MUKALLA,
    HAJJAH,
    AMRAN,
    SAADA,
    SEIYUN,
    ZINJIBAR,
    MARIB,
    BAYDA,
    LAHIJ,
    ABYAN,
    SHABWAH,
    MAHWIT,
    HADRAMOUT,
    JAWF,
    MAHRA,
    SOCOTRA,
  ];

  /// خريطة المدن مع الـ Emoji
  static const Map<String, String> CITY_EMOJI = {
    SANAA: '🏛️',
    ADEN: '🌊',
    TAIZ: '⛰️',
    HODEIDAH: '🏖️',
    IBB: '🌄',
    DHAMAR: '🏔️',
    MUKALLA: '🏝️',
    HAJJAH: '🌾',
    AMRAN: '🏰',
    SAADA: '🏜️',
    SEIYUN: '🕌',
    ZINJIBAR: '🏘️',
    MARIB: '🏛️',
    BAYDA: '⛰️',
    LAHIJ: '🌳',
    ABYAN: '🌴',
    SHABWAH: '🏔️',
    MAHWIT: '🌄',
    HADRAMOUT: '🏛️',
    JAWF: '🏜️',
    MAHRA: '🏝️',
    SOCOTRA: '🏝️',
  };

  /// الحصول على Emoji للمدينة
  static String getEmoji(String city) {
    return CITY_EMOJI[city] ?? '🏙️';
  }

  /// التحقق من صحة المدينة
  static bool isValidCity(String city) {
    return ALL_CITIES.contains(city);
  }

  /// الحصول على اسم المدينة مع Emoji
  static String getCityWithEmoji(String city) {
    return '${getEmoji(city)} $city';
  }

  /// البحث عن مدينة بالاسم (case-insensitive)
  static String? findCity(String query) {
    final normalizedQuery = query.trim();
    return ALL_CITIES.firstWhere(
      (city) => city == normalizedQuery,
      orElse: () => DEFAULT_CITY,
    );
  }
}

/// Extension على String للمدن
extension CityExtension on String {
  /// هل المدينة صحيحة؟
  bool get isValidYemeniCity => YemeniCities.isValidCity(this);

  /// الحصول على Emoji
  String get cityEmoji => YemeniCities.getEmoji(this);

  /// الحصول على المدينة مع Emoji
  String get cityWithEmoji => YemeniCities.getCityWithEmoji(this);
}

