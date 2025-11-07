# 🏦 خدمة الحسابات البنكية المحلية (Local Payment Accounts)

> ✅ **تم التحقق**: متطابقة مع الكود الفعلي في `backend/src/modules/system-settings`  
> 📅 **آخر تحديث**: نوفمبر 2025  
> 👥 **مخاطبة لـ**: المستخدمين، التجار، والمهندسين (بدون صلاحيات إدارية)

تعرض هذه الخدمة حسابات الدفع المحلية (البنوك والمحافظ) المتاحة للإيداعات والتحويلات. جميع العمليات هنا للقراءة فقط. الإضافة/التعديل/الحذف متاحة للإدارة عبر endpoints أخرى ولا تُغطي في هذا المستند.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تُغلّف بـ `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. القائمة الفعلية متاحة داخل `data['data']`. راجع `docs/flutter-integration/01-response-structure.md`.

---

## 📋 جدول المحتويات

1. [قائمة الحسابات المجمعة (عام)](#1-قائمة-الحسابات-المجمعة-عام)
2. [قائمة الحسابات بعملة محددة](#2-قائمة-الحسابات-بعملة-محددة)
3. [نماذج Flutter](#نماذج-flutter)
4. [ملاحظات مهمة](#📝-ملاحظات-مهمة)

---

## 1. قائمة الحسابات المجمعة (عام)

يعيد جميع حسابات الدفع المحلية النشطة، مجمّعة حسب اسم البنك/المحفظة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/system-settings/payment-accounts/public`
- **Query Params:** none (افتراضيًا يعيد كل العملات)
- **Auth Required:** ❌ لا
- **Cache:** ✅ يمكن تخزين النتيجة محلياً (لا تتغير بشكل متكرر)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "providerName": "الكريمي",
        "iconUrl": "https://cdn.example.com/icons/alkuraimi.svg",
        "type": "bank",
        "accounts": [
          {
            "id": "64acc001",
            "accountNumber": "1234567890",
            "currency": "YER",
            "isActive": true,
            "displayOrder": 0
          },
          {
            "id": "64acc002",
            "accountNumber": "1234567891",
            "currency": "USD",
            "isActive": true,
            "displayOrder": 1
          }
        ]
      },
      {
        "providerName": "محفظة XYZ",
        "iconUrl": "https://cdn.example.com/icons/xyz-wallet.png",
        "type": "wallet",
        "accounts": [
          {
            "id": "64acc010",
            "accountNumber": "9876543210",
            "currency": "YER",
            "isActive": true,
            "displayOrder": 0
          }
        ]
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### أخطاء محتملة

| الحالة | الوصف | المخرجات |
|--------|-------|----------|
| 200 | حتى لو لا يوجد حسابات، تُعاد قائمة فارغة | `"data": { "data": [] }` |

### كود Flutter

```dart
Future<List<GroupedPaymentAccount>> getPublicPaymentAccounts() async {
  final response = await _dio.get('/system-settings/payment-accounts/public');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final list = apiResponse.data!['data'] as List;
    return list.map((item) => GroupedPaymentAccount.fromJson(item)).toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. قائمة الحسابات بعملة محددة

يعيد الحسابات النشطة لعملة محددة فقط (YER أو SAR أو USD).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/system-settings/payment-accounts/public`
- **Query Params:**  
  - `currency` (اختياري) قيمته واحدة من: `YER`, `SAR`, `USD`
- **Auth Required:** ❌ لا

### مثال طلب

```
GET /system-settings/payment-accounts/public?currency=USD
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "providerName": "الكريمي",
        "iconUrl": "https://cdn.example.com/icons/alkuraimi.svg",
        "type": "bank",
        "accounts": [
          {
            "id": "64acc002",
            "accountNumber": "1234567891",
            "currency": "USD",
            "isActive": true,
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### أخطاء محتملة

| الحالة | الوصف | المخرجات |
|--------|-------|----------|
| 200 | إذا لم توجد حسابات بالعملة المطلوبة، تُعاد قائمة فارغة | `"data": { "data": [] }` |

### كود Flutter

```dart
Future<List<GroupedPaymentAccount>> getPaymentAccountsByCurrency(String currency) async {
  final response = await _dio.get(
    '/system-settings/payment-accounts/public',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final list = apiResponse.data!['data'] as List;
    return list.map((item) => GroupedPaymentAccount.fromJson(item)).toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## نماذج Flutter

### `GroupedPaymentAccount`

```dart
class GroupedPaymentAccount {
  final String providerName;
  final String? iconUrl;
  final String type; // bank أو wallet
  final List<PaymentAccountItem> accounts;

  GroupedPaymentAccount({
    required this.providerName,
    this.iconUrl,
    required this.type,
    required this.accounts,
  });

  factory GroupedPaymentAccount.fromJson(Map<String, dynamic> json) {
    final items = (json['accounts'] as List)
        .map((item) => PaymentAccountItem.fromJson(item as Map<String, dynamic>))
        .toList();

    return GroupedPaymentAccount(
      providerName: json['providerName'] ?? '',
      iconUrl: json['iconUrl'],
      type: json['type'] ?? 'bank',
      accounts: items,
    );
  }
}
```

### `PaymentAccountItem`

```dart
class PaymentAccountItem {
  final String id;
  final String accountNumber;
  final String currency;
  final bool isActive;
  final int displayOrder;

  PaymentAccountItem({
    required this.id,
    required this.accountNumber,
    required this.currency,
    required this.isActive,
    required this.displayOrder,
  });

  factory PaymentAccountItem.fromJson(Map<String, dynamic> json) {
    return PaymentAccountItem(
      id: json['id'],
      accountNumber: json['accountNumber'],
      currency: json['currency'],
      isActive: json['isActive'] ?? true,
      displayOrder: (json['displayOrder'] ?? 0) as int,
    );
  }
}
```

### خدمة Flutter بسيطة

```dart
class LocalPaymentAccountsService {
  final Dio _dio;

  LocalPaymentAccountsService(this._dio);

  Future<List<GroupedPaymentAccount>> fetchAll() =>
      _fetchAccounts();

  Future<List<GroupedPaymentAccount>> fetchByCurrency(String currency) =>
      _fetchAccounts(params: {'currency': currency});

  Future<List<GroupedPaymentAccount>> _fetchAccounts({Map<String, dynamic>? params}) async {
    final response = await _dio.get(
      '/system-settings/payment-accounts/public',
      queryParameters: params,
    );

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (json) => json as Map<String, dynamic>,
    );

    if (!apiResponse.isSuccess) {
      throw ApiException(apiResponse.error!);
    }

    final list = apiResponse.data!['data'] as List;
    return list
        .map((item) => GroupedPaymentAccount.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
```

---

## 📝 ملاحظات مهمة

1. **جميع الحسابات النشطة فقط:** يتم ترشيح الحسابات غير المفعّلة تلقائياً (`isActive = true`).
2. **تجميع حسب البنك/المحفظة:** النتائج تأتي مجمّعة، مثالية لعرض Accordion أو قوائم موسّعة.
3. **ترتيب العرض:** استخدم `displayOrder` لترتيب الحسابات داخل نفس البنك، واحتفظ بالترتيب المقدم لعرض أكثر من بنك.
4. **دعم العملات المتعددة:** `currency` يدعم `YER`, `SAR`, `USD`. إضافة عملة جديدة تستلزم تحديث الـ Backend أولاً.
5. **نوع الحساب:** الحقل `type` يمكن أن يكون `bank` أو `wallet` (راجع `PaymentAccountType` في الـ Backend).
6. **الحماية:** لا حاجة لتوكن؛ هذه البيانات متاحة لكل المستخدمين، التجار، والمهندسين (تم الحرص على إخفاء بيانات إدارية مثل `updatedBy`).
7. **التخزين المؤقت:** يُنصح بتخزين النتيجة في التطبيق وإعادة التحديث عند الحاجة لتقليل الضغط على الخادم.

---

**التالي المقترح:** [خدمة السياسات (Policies Service)](./15-policies-service.md)


