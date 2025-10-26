# دليل دمج نظام المدن اليمنية في Flutter

## 📱 نظرة عامة

دليل شامل لدمج نظام المدن اليمنية في تطبيق Flutter للخدمات.

---

## 📦 الملفات المطلوبة

### 1. Constants File
**Path:** `lib/constants/yemeni_cities.dart`

انسخ محتوى ملف `yemeni-cities-constants.dart` إلى مشروع Flutter.

---

## 🔧 التكامل مع الخدمات

### 1. تحديث Service Request Model

```dart
// في lib/models/services/service_request.dart

class ServiceRequest {
  final String id;
  final String userId;
  final String title;
  final String? type;
  final String? description;
  final String city; // ⭐ جديد
  final List<String> images;
  // ... باقي الحقول
  
  ServiceRequest({
    required this.id,
    required this.userId,
    required this.title,
    this.type,
    this.description,
    this.city = YemeniCities.DEFAULT_CITY, // ⭐ القيمة الافتراضية
    required this.images,
    // ... باقي الحقول
  });
  
  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      type: json['type'],
      description: json['description'],
      city: json['city'] ?? YemeniCities.DEFAULT_CITY, // ⭐ جديد
      images: List<String>.from(json['images'] ?? []),
      // ... باقي الحقول
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'title': title,
      if (type != null) 'type': type,
      if (description != null) 'description': description,
      'city': city, // ⭐ جديد
      'images': images,
      // ... باقي الحقول
    };
  }
}
```

---

### 2. تحديث Create Service Request DTO

```dart
// في lib/models/services/dtos/create_service_request_dto.dart

class CreateServiceRequestDto {
  final String title;
  final String? type;
  final String? description;
  final String city; // ⭐ جديد
  final List<String>? images;
  final String addressId;
  final DateTime? scheduledAt;

  CreateServiceRequestDto({
    required this.title,
    this.type,
    this.description,
    this.city = YemeniCities.DEFAULT_CITY, // ⭐ القيمة الافتراضية
    this.images,
    required this.addressId,
    this.scheduledAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (type != null) 'type': type,
      if (description != null) 'description': description,
      'city': city, // ⭐ إلزامي
      if (images != null && images!.isNotEmpty) 'images': images,
      'addressId': addressId,
      if (scheduledAt != null) 'scheduledAt': scheduledAt!.toIso8601String(),
    };
  }
  
  // Validation
  String? validate() {
    if (title.isEmpty) return 'العنوان مطلوب';
    if (title.length > 140) return 'العنوان طويل جداً';
    if (!YemeniCities.isValidCity(city)) return 'المدينة غير صحيحة';
    if (addressId.isEmpty) return 'العنوان مطلوب';
    return null;
  }
}
```

---

### 3. تحديث Services Service

```dart
// في lib/services/services_service.dart

class ServicesService {
  final Dio _dio;

  ServicesService(this._dio);

  /// إنشاء طلب خدمة جديد
  Future<ServiceRequest> createServiceRequest({
    required String title,
    String? type,
    String? description,
    String city = YemeniCities.DEFAULT_CITY, // ⭐ جديد
    List<String>? images,
    required String addressId,
    DateTime? scheduledAt,
  }) async {
    // Validation
    if (!YemeniCities.isValidCity(city)) {
      throw Exception('المدينة غير صحيحة: $city');
    }

    final dto = CreateServiceRequestDto(
      title: title,
      type: type,
      description: description,
      city: city, // ⭐ جديد
      images: images,
      addressId: addressId,
      scheduledAt: scheduledAt,
    );

    final validationError = dto.validate();
    if (validationError != null) {
      throw Exception(validationError);
    }

    final response = await _dio.post('/services/customer', 
      data: dto.toJson(),
    );

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (json) => json as Map<String, dynamic>,
    );

    if (apiResponse.isSuccess) {
      return ServiceRequest.fromJson(apiResponse.data!['data']);
    } else {
      throw ApiException(apiResponse.error!);
    }
  }

  /// البحث عن طلبات قريبة (للمهندسين)
  /// ملاحظة: سيتم فلترة النتائج تلقائياً حسب مدينة المهندس في الباك إند
  Future<List<ServiceRequest>> getNearbyRequests({
    required double lat,
    required double lng,
    double radiusKm = 10,
  }) async {
    final response = await _dio.get('/services/engineer/requests/nearby', 
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radiusKm': radiusKm,
      },
    );

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (json) => json as Map<String, dynamic>,
    );

    if (apiResponse.isSuccess) {
      return (apiResponse.data!['data'] as List)
          .map((item) => ServiceRequest.fromJson(item))
          .toList();
    } else {
      throw ApiException(apiResponse.error!);
    }
  }
}
```

---

## 🎨 UI Components

### 1. City Dropdown Widget

```dart
// في lib/widgets/city_dropdown.dart

import 'package:flutter/material.dart';
import '../constants/yemeni_cities.dart';

class CityDropdown extends StatelessWidget {
  final String? value;
  final ValueChanged<String?>? onChanged;
  final bool enabled;
  final String? errorText;
  final bool required;

  const CityDropdown({
    Key? key,
    this.value,
    this.onChanged,
    this.enabled = true,
    this.errorText,
    this.required = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value ?? (required ? null : YemeniCities.DEFAULT_CITY),
      decoration: InputDecoration(
        labelText: required ? 'المدينة *' : 'المدينة',
        prefixIcon: const Icon(Icons.location_city),
        errorText: errorText,
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      items: YemeniCities.ALL_CITIES.map((city) {
        return DropdownMenuItem<String>(
          value: city,
          child: Row(
            children: [
              Text(
                YemeniCities.getEmoji(city),
                style: const TextStyle(fontSize: 20),
              ),
              const SizedBox(width: 12),
              Text(city),
            ],
          ),
        );
      }).toList(),
      onChanged: enabled ? onChanged : null,
      validator: required
          ? (value) {
              if (value == null || value.isEmpty) {
                return 'المدينة مطلوبة';
              }
              if (!YemeniCities.isValidCity(value)) {
                return 'المدينة غير صحيحة';
              }
              return null;
            }
          : null,
    );
  }
}
```

---

### 2. City Chip Widget

```dart
// في lib/widgets/city_chip.dart

import 'package:flutter/material.dart';
import '../constants/yemeni_cities.dart';

class CityChip extends StatelessWidget {
  final String city;
  final Color? backgroundColor;
  final Color? textColor;
  final bool showEmoji;

  const CityChip({
    Key? key,
    required this.city,
    this.backgroundColor,
    this.textColor,
    this.showEmoji = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: showEmoji
          ? Text(
              YemeniCities.getEmoji(city),
              style: const TextStyle(fontSize: 16),
            )
          : null,
      label: Text(
        city,
        style: TextStyle(
          color: textColor ?? Colors.white,
          fontWeight: FontWeight.w500,
        ),
      ),
      backgroundColor: backgroundColor ?? Theme.of(context).primaryColor,
    );
  }
}
```

---

### 3. Service Request Form

```dart
// في lib/screens/services/create_request_screen.dart

class CreateRequestScreen extends StatefulWidget {
  @override
  _CreateRequestScreenState createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  
  String _title = '';
  String? _type;
  String? _description;
  String _city = YemeniCities.DEFAULT_CITY; // ⭐ المدينة الافتراضية
  List<String> _images = [];
  String? _addressId;
  DateTime? _scheduledAt;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلب خدمة جديد'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // عنوان الطلب
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'عنوان الطلب *',
                prefixIcon: Icon(Icons.title),
              ),
              maxLength: 140,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'العنوان مطلوب';
                }
                return null;
              },
              onSaved: (value) => _title = value!,
            ),
            
            const SizedBox(height: 16),
            
            // نوع الخدمة
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'نوع الخدمة',
                prefixIcon: Icon(Icons.build),
              ),
              items: const [
                DropdownMenuItem(value: 'INSTALLATION', child: Text('تركيب')),
                DropdownMenuItem(value: 'MAINTENANCE', child: Text('صيانة')),
                DropdownMenuItem(value: 'REPAIR', child: Text('إصلاح')),
                DropdownMenuItem(value: 'CONSULTATION', child: Text('استشارة')),
              ],
              onChanged: (value) => setState(() => _type = value),
            ),
            
            const SizedBox(height: 16),
            
            // المدينة ⭐ جديد
            CityDropdown(
              value: _city,
              onChanged: (value) => setState(() => _city = value ?? YemeniCities.DEFAULT_CITY),
              required: true,
            ),
            
            const SizedBox(height: 16),
            
            // وصف الطلب
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'وصف الطلب',
                prefixIcon: Icon(Icons.description),
              ),
              maxLines: 4,
              onSaved: (value) => _description = value,
            ),
            
            const SizedBox(height: 24),
            
            // زر الإرسال
            ElevatedButton(
              onPressed: _submitForm,
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Text('إرسال الطلب'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    
    _formKey.currentState!.save();

    try {
      final servicesService = context.read<ServicesService>();
      
      final request = await servicesService.createServiceRequest(
        title: _title,
        type: _type,
        description: _description,
        city: _city, // ⭐ المدينة
        images: _images,
        addressId: _addressId!,
        scheduledAt: _scheduledAt,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('تم إنشاء الطلب في ${_city.cityWithEmoji}'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context, request);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطأ: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
```

---

### 2. عرض قائمة الطلبات مع المدن

```dart
// في lib/screens/services/requests_list_screen.dart

class RequestCard extends StatelessWidget {
  final ServiceRequest request;

  const RequestCard({Key? key, required this.request}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          child: Text(YemeniCities.getEmoji(request.city)),
        ),
        title: Text(request.title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(request.description ?? 'لا يوجد وصف'),
            const SizedBox(height: 4),
            // عرض المدينة ⭐
            CityChip(city: request.city),
          ],
        ),
        trailing: StatusChip(status: request.status),
        onTap: () => _viewDetails(context, request),
      ),
    );
  }
}
```

---

### 3. فلتر حسب المدينة

```dart
// في lib/screens/services/requests_filter_screen.dart

class RequestsFilterSheet extends StatefulWidget {
  final RequestsFilter currentFilter;

  const RequestsFilterSheet({Key? key, required this.currentFilter}) : super(key: key);

  @override
  _RequestsFilterSheetState createState() => _RequestsFilterSheetState();
}

class _RequestsFilterSheetState extends State<RequestsFilterSheet> {
  late String? _selectedCity;
  late String? _selectedStatus;
  late String? _selectedType;

  @override
  void initState() {
    super.initState();
    _selectedCity = widget.currentFilter.city;
    _selectedStatus = widget.currentFilter.status;
    _selectedType = widget.currentFilter.type;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'فلترة الطلبات',
            style: Theme.of(context).textTheme.headline6,
          ),
          const SizedBox(height: 16),
          
          // فلتر المدينة ⭐ جديد
          CityDropdown(
            value: _selectedCity,
            onChanged: (value) => setState(() => _selectedCity = value),
            enabled: true,
          ),
          
          const SizedBox(height: 16),
          
          // فلتر الحالة
          DropdownButtonFormField<String>(
            value: _selectedStatus,
            decoration: const InputDecoration(
              labelText: 'الحالة',
              prefixIcon: Icon(Icons.filter_list),
            ),
            items: const [
              DropdownMenuItem(value: null, child: Text('الكل')),
              DropdownMenuItem(value: 'OPEN', child: Text('مفتوح')),
              DropdownMenuItem(value: 'ASSIGNED', child: Text('معين')),
              DropdownMenuItem(value: 'COMPLETED', child: Text('مكتمل')),
            ],
            onChanged: (value) => setState(() => _selectedStatus = value),
          ),
          
          const SizedBox(height: 24),
          
          ElevatedButton(
            onPressed: () {
              final filter = RequestsFilter(
                city: _selectedCity,
                status: _selectedStatus,
                type: _selectedType,
              );
              Navigator.pop(context, filter);
            },
            child: const Text('تطبيق الفلتر'),
          ),
        ],
      ),
    );
  }
}
```

---

## 📊 الإحصائيات حسب المدينة

### Statistics Screen

```dart
// في lib/screens/services/statistics_screen.dart

class CityStatisticsWidget extends StatelessWidget {
  final Map<String, CityStats> citiesStats;

  const CityStatisticsWidget({Key? key, required this.citiesStats}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final sortedCities = citiesStats.entries.toList()
      ..sort((a, b) => b.value.requestsCount.compareTo(a.value.requestsCount));

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'الطلبات حسب المدينة',
              style: Theme.of(context).textTheme.headline6,
            ),
            const SizedBox(height: 16),
            ...sortedCities.map((entry) {
              final city = entry.key;
              final stats = entry.value;
              
              return ListTile(
                leading: Text(
                  YemeniCities.getEmoji(city),
                  style: const TextStyle(fontSize: 24),
                ),
                title: Text(city),
                subtitle: Text(
                  '${stats.requestsCount} طلب • ${stats.engineersCount} مهندس',
                ),
                trailing: Text(
                  '${stats.averageRequestsPerEngineer.toStringAsFixed(1)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}

class CityStats {
  final int requestsCount;
  final int engineersCount;
  
  CityStats({
    required this.requestsCount,
    required this.engineersCount,
  });
  
  double get averageRequestsPerEngineer => 
      engineersCount > 0 ? requestsCount / engineersCount : 0;
}
```

---

## 🧪 الاختبار

### Unit Tests

```dart
// في test/services/yemeni_cities_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/constants/yemeni_cities.dart';

void main() {
  group('YemeniCities', () {
    test('should have 22 cities', () {
      expect(YemeniCities.ALL_CITIES.length, 22);
    });

    test('default city should be Sanaa', () {
      expect(YemeniCities.DEFAULT_CITY, 'صنعاء');
    });

    test('should validate correct cities', () {
      expect(YemeniCities.isValidCity('صنعاء'), true);
      expect(YemeniCities.isValidCity('عدن'), true);
      expect(YemeniCities.isValidCity('مدينة غير موجودة'), false);
    });

    test('should return emoji for cities', () {
      expect(YemeniCities.getEmoji('صنعاء'), '🏛️');
      expect(YemeniCities.getEmoji('عدن'), '🌊');
      expect(YemeniCities.getEmoji('تعز'), '⛰️');
    });

    test('should return default emoji for unknown city', () {
      expect(YemeniCities.getEmoji('مدينة غير موجودة'), '🏙️');
    });
  });

  group('CityExtension', () {
    test('should validate city using extension', () {
      expect('صنعاء'.isValidYemeniCity, true);
      expect('مدينة خاطئة'.isValidYemeniCity, false);
    });

    test('should get emoji using extension', () {
      expect('صنعاء'.cityEmoji, '🏛️');
      expect('عدن'.cityEmoji, '🌊');
    });

    test('should get city with emoji', () {
      expect('صنعاء'.cityWithEmoji, '🏛️ صنعاء');
      expect('عدن'.cityWithEmoji, '🌊 عدن');
    });
  });
}
```

---

## 📝 أمثلة الاستخدام

### مثال 1: إنشاء طلب خدمة

```dart
final request = await servicesService.createServiceRequest(
  title: 'إصلاح لوح شمسي',
  type: 'REPAIR',
  description: 'اللوح لا يعمل بكفاءة',
  city: 'صنعاء', // ⭐ إلزامي
  addressId: selectedAddress.id,
  scheduledAt: DateTime.now().add(Duration(days: 2)),
);

print('تم إنشاء الطلب في ${request.city.cityWithEmoji}');
```

### مثال 2: البحث عن طلبات قريبة (للمهندسين)

```dart
// المهندس من صنعاء
final nearbyRequests = await servicesService.getNearbyRequests(
  lat: 15.3694,
  lng: 44.2060,
  radiusKm: 10,
);

// ستعود فقط طلبات صنعاء
for (var request in nearbyRequests) {
  print('${request.title} - ${request.city.cityWithEmoji}');
  // سيطبع فقط طلبات من صنعاء
}
```

### مثال 3: عرض إحصائيات المدن

```dart
final citiesStats = await analyticsService.getCityStatistics();

for (var entry in citiesStats.entries) {
  final city = entry.key;
  final stats = entry.value;
  
  print('${city.cityWithEmoji}:');
  print('  - الطلبات: ${stats.requestsCount}');
  print('  - المهندسين: ${stats.engineersCount}');
  print('  - المعدل: ${stats.averageRequestsPerEngineer.toStringAsFixed(1)}');
}
```

---

## ⚠️ ملاحظات مهمة

### 1. Validation
- **إلزامي:** حقل `city` مطلوب في كل طلب خدمة
- **Validation:** يجب أن تكون المدينة من القائمة المدعومة
- **Default:** القيمة الافتراضية "صنعاء"

### 2. الفلترة التلقائية
- عند بحث المهندس عن طلبات، الباك إند يفلتر تلقائياً حسب مدينته
- لا حاجة لإرسال city في query parameters

### 3. UI/UX
- استخدم Emoji لجعل الواجهة أجمل
- اعرض المدينة بوضوح في كل طلب
- استخدم CityChip للعرض المدمج

### 4. Error Handling
```dart
try {
  final request = await servicesService.createServiceRequest(...);
} on ValidationException catch (e) {
  // المدينة غير صحيحة
  showError(context, e.message);
} on ApiException catch (e) {
  // خطأ من الباك إند
  showError(context, e.message);
}
```

---

## 🚀 الخطوات التالية

1. ✅ انسخ `yemeni-cities-constants.dart` إلى `lib/constants/`
2. ✅ أنشئ `CityDropdown` widget
3. ✅ أنشئ `CityChip` widget
4. ✅ حدّث `ServiceRequest` model لإضافة `city`
5. ✅ حدّث `CreateServiceRequestDto` لإضافة `city`
6. ✅ حدّث نماذج إنشاء الطلبات
7. ✅ حدّث قوائم عرض الطلبات
8. ✅ اختبر النظام

---

## 📚 ملفات ذات صلة

### Flutter Files
- `lib/constants/yemeni_cities.dart` - Constants
- `lib/widgets/city_dropdown.dart` - Dropdown widget
- `lib/widgets/city_chip.dart` - Chip widget
- `lib/models/services/service_request.dart` - Model
- `lib/services/services_service.dart` - Service

### Backend Files
- `backend/src/modules/services/enums/yemeni-cities.enum.ts`
- `backend/src/modules/services/schemas/service-request.schema.ts`
- `backend/src/modules/services/dto/requests.dto.ts`

### Documentation
- `docs/flutter-integration/14-services-service.md` - محدث ⭐
- `docs/requirements/flows/services/city-filtering-flow.mmd` - جديد ⭐
- `backend/src/modules/services/CITIES_FILTERING_GUIDE.md`

---

## ✨ النتيجة النهائية

✅ **نظام متكامل** - دعم كامل للمدن اليمنية
✅ **فلترة ذكية** - المهندسون يرون طلبات مدينتهم فقط
✅ **واجهة جميلة** - Emoji لكل مدينة
✅ **Validation قوي** - منع الأخطاء
✅ **تجربة ممتازة** - سهولة الاستخدام

**🎉 جاهز للتطبيق في Flutter!**

