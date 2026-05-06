# مهام مراجعة الثغرات الأمنية

تاريخ التحليل: 2026-04-28

هذا الملف يلخص أهم المخاطر التي ظهرت من فحص سريع للكود المحلي، مع تقسيم المهام إلى قسم التطبيق وقسم الباك اند. لم يتم نسخ القيم السرية كاملة داخل هذا التقرير؛ عند وجود مفتاح مكشوف تم ذكر المسار والسطر فقط.

## قسم التطبيق Flutter

تم تنفيذ الجزء البرمجي من مهام Flutter بتاريخ 2026-04-28:

- إزالة مفاتيح Google Maps/Firebase الحقيقية من ملفات التطبيق واستبدالها بمتغيرات بناء.
- تحويل البصمة من تخزين كلمة المرور إلى تخزين refresh token قابل للإلغاء.
- تشفير صناديق Hive المحلية عبر مفتاح محفوظ في `flutter_secure_storage`.
- تعطيل Android backup وإضافة قواعد استثناء للنسخ الاحتياطي ونقل الجهاز.
- تقليل سجلات `AppLogger` في إصدارات release.

### حرجة

- [ ] تدوير مفاتيح Google Maps/Firebase المضمّنة في التطبيق وتقييدها من Google Cloud Console.
  - الحالة: يحتاج تنفيذ خارجي من Google Cloud/Firebase Console. تمت إزالة القيم الحقيقية من الكود المحلي.
  - الدليل: `tagadod_app/android/app/src/main/AndroidManifest.xml:62` يحتوي مفتاح Google Maps صريحًا.
  - الدليل: `tagadod_app/ios/Runner/Info.plist:63` و `tagadod_app/ios/Runner/AppDelegate.swift:13` يحتويان مفتاح Google Maps صريحًا.
  - الدليل: `tagadod_app/lib/firebase_options.dart:44`, `:54`, `:62`, `:71`, `:80` تحتوي مفاتيح Firebase للمنصات.
  - المطلوب: إنشاء مفاتيح منفصلة Android/iOS/Web، تقييد Android بـ package name + SHA-1/SHA-256، وتقييد iOS بـ bundle id، وتقييد APIs المستخدمة فقط مثل Maps SDK وFirebase APIs الضرورية.

- [x] إزالة مفتاح خرائط Google من الكود المباشر واعتماده عبر إعدادات بناء آمنة لكل بيئة.
  - الدليل: المفتاح مكرر في Android وiOS بدل حقنه من ملفات build config.
  - المطلوب: استخدام `local.properties`/Gradle manifest placeholders للأندرويد و`xcconfig`/build settings للـ iOS، مع ملفات أمثلة فقط داخل Git.

- [x] منع حفظ كلمة مرور المستخدم لأغراض البصمة واستبدالها بتوكن/مفتاح جلسة قابل للإلغاء.
  - الدليل: `tagadod_app/lib/core/services/local_biometric_service.dart:63-70` يحفظ phone/password.
  - الدليل: `tagadod_app/lib/core/services/biometric_storage_service.dart:26-34` يحفظ phone/password أيضًا.
  - المطلوب: تخزين refresh token أو biometric credential id فقط، وربطه بجهاز المستخدم من الباك اند، مع إمكانية الإلغاء عند تغيير كلمة المرور أو تسجيل الخروج من جميع الأجهزة.

### عالية

- [ ] تقليل صلاحيات الصور والكاميرا والموقع إلى الحد الأدنى وتوثيق سبب كل إذن.
  - الدليل: `tagadod_app/android/app/src/main/AndroidManifest.xml` يطلب الموقع، الكاميرا، وقراءة الوسائط.
  - المطلوب: طلب الصلاحية عند الحاجة فقط، وتجنب الصلاحيات الواسعة إن أمكن، ومراجعة نصوص iOS الخاصة بالموقع والصور.

- [x] مراجعة التخزين المحلي غير المشفر للبيانات الحساسة.
  - الدليل: `tagadod_app/lib/core/di/injection.dart:46-50` يفتح صناديق Hive مثل favorites/categories/local_cart بدون تشفير.
  - المطلوب: تحديد ما إذا كانت السلة أو طلبات الصيانة أو العناوين تحتوي بيانات شخصية، ثم استخدام Hive encryption أو حذف البيانات الحساسة عند logout.

- [x] تنظيف سجلات التطبيق قبل الإصدار.
  - الدليل: يوجد عدد كبير من `debugPrint`/`developer.log` داخل `tagadod_app/lib`، و`LogInterceptor` يطبع request/response عند تفعيل `HTTP_LOG`.
  - المطلوب: منع طباعة التوكنات، أرقام الهواتف، عناوين المستخدمين، payloads، أو أخطاء الشبكة التفصيلية في release builds.

- [ ] إضافة فحص تلقائي قبل النشر للبحث عن الأسرار داخل Flutter.
  - الدليل: وجود مفاتيح حقيقية داخل ملفات المنصة و`firebase_options.dart`.
  - المطلوب: إضافة secret scanning مثل gitleaks/trufflehog إلى CI، مع baseline للمفاتيح العامة المسموحة فقط بعد تقييدها.

### متوسطة

- [x] مراجعة إعدادات النسخ الاحتياطي على Android.
  - الدليل: `AndroidManifest.xml` لا يضبط `android:allowBackup` أو `fullBackupContent`.
  - المطلوب: تعطيل النسخ الاحتياطي أو استثناء التخزين الحساس، خاصة `flutter_secure_storage` وأي Hive boxes قد تحتوي بيانات مستخدم.

- [x] فصل إعدادات Firebase وGoogle Services حسب البيئة.
  - الدليل: `tagadod_app/android/app/google-services.json` و`tagadod_app/ios/Runner/GoogleService-Info.plist` موجودان داخل المشروع.
  - المطلوب: مشاريع Firebase منفصلة dev/staging/prod، مع rules صارمة للتخزين والرسائل، وعدم استخدام نفس المفاتيح لكل البيئات.

## قسم الباك اند

### حرجة

- [ ] تدوير أسرار WAHA المكشوفة ونقلها إلى ملف بيئة غير مرفوع إلى Git.
  - الدليل: `docker-compose.yml:119-121` يحتوي `WAHA_API_KEY` وكلمة مرور dashboard مباشرة.
  - المطلوب: استبدالها بمتغيرات `${WAHA_API_KEY}` و`${WAHA_DASHBOARD_PASSWORD}`، تدوير القيم الحالية، وتقييد منفذ WAHA خلف الشبكة الداخلية أو reverse proxy محمي.

- [ ] تفعيل rate limiting عام ومخصص لمسارات المصادقة وOTP.
  - الدليل: `backend/src/app.module.ts:90-95` و `:143-144` تظهر أن Throttler معطل.
  - الدليل: مسارات `send-otp`, `forgot-password`, `verify-reset-otp`, `user-login`, `admin-login`, `refresh` ظاهرة في `backend/src/modules/auth/auth.controller.ts`.
  - المطلوب: حدود حسب IP ورقم الهاتف والجهاز، cooldown لإرسال OTP، عدد محاولات تحقق OTP، وقفل مؤقت لمحاولات login الفاشلة.

- [ ] تقصير عمر access token وربط refresh tokens بحالة قابلة للإلغاء.
  - الدليل: `backend/src/modules/auth/tokens.service.ts:7-11` يستخدم access لمدة 7 أيام وrefresh لمدة 30 يومًا.
  - المطلوب: access من 15 إلى 60 دقيقة، refresh مع rotation وjti مخزن في Redis/DB، وإبطال refresh عند logout أو تغيير كلمة المرور.

### عالية

- [ ] تطبيق فحص البيئة `envSchema` فعليًا وتشديد قواعد الأسرار.
  - الدليل: `backend/src/config/env.validation.ts` يعرّف schema، لكن `ConfigModule.forRoot` في `backend/src/app.module.ts:64-67` لا يستخدمه.
  - المطلوب: تمرير validate إلى `ConfigModule.forRoot`، وفرض حد أدنى قوي لـ `JWT_SECRET` و`REFRESH_SECRET` و`SUPER_ADMIN_SECRET` بدلاً من `.min(1)`.

- [ ] إغلاق Swagger/OpenAPI في الإنتاج أو حمايته.
  - الدليل: `backend/src/main.ts:128-134` يستدعي `setupSwagger(app)` دائمًا.
  - الدليل: `backend/src/swagger.ts:73-77` يفعّل `persistAuthorization`.
  - المطلوب: تشغيل Swagger فقط في development/staging أو حمايته بـ Basic Auth/IP allowlist، وإيقاف حفظ التوكنات في المتصفح.

- [ ] تشديد CORS وHelmet CSP في الإنتاج.
  - الدليل: `backend/src/main.ts:64-86` يسمح بـ `http:`, `https:`, `ws:`, `wss:`, و`unsafe-inline/unsafe-eval`.
  - الدليل: `backend/src/main.ts:96-114` يستخدم origins افتراضية فيها localhost عند غياب `CORS_ORIGINS`.
  - المطلوب: رفض التشغيل production بدون `CORS_ORIGINS` صريح، وحذف `unsafe-eval` إلا عند الحاجة الموثقة، وفصل CSP للـ API عن الواجهات.

- [ ] مراجعة صلاحيات upload/delete للملفات والفيديو.
  - الدليل: `backend/src/modules/upload/upload.controller.ts:44` يحمي كل المسارات بـ JWT فقط دون Admin/Roles.
  - الدليل: `backend/src/modules/upload/upload.controller.ts:215-240` يسمح بحذف ملف عبر `filePath`.
  - الدليل: `backend/src/modules/upload/upload.controller.ts:377-399` يسمح بحذف فيديو عبر `videoId`.
  - المطلوب: فرض ملكية الملف أو صلاحيات admin، منع path traversal، وتسجيل audit log لكل حذف أو رفع حساس.

- [ ] تقوية فحص نوع الملفات في الرفع.
  - الدليل: `backend/src/modules/upload/upload.module.ts:18-24` لا يستخدم fileFilter على مستوى Multer.
  - الدليل: `backend/src/modules/upload/upload.service.ts:175-237` يعتمد على `mimetype` المرسل ويقبل أنواعًا واسعة مثل json/csv/doc/excel/video.
  - المطلوب: فحص magic bytes، فحص امتداد الملف، فحص malware إن أمكن، وفصل endpoints للصور عن المستندات والفيديو.

### متوسطة

- [ ] إزالة القيم الافتراضية الحساسة من أمثلة البيئة.
  - الدليل: `backend/.env.example:89` و`backend/env.example:131` يحتويان قيمة `SUPER_ADMIN_SECRET` افتراضية.
  - المطلوب: وضع placeholder واضح فقط، ورفض تشغيل create-super-admin إذا بقيت القيمة الافتراضية.

- [ ] مراجعة مسار `create-super-admin` وإغلاقه أكثر في غير الإنتاج.
  - الدليل: `backend/src/modules/auth/auth.controller.ts:1340-1348` يمنع الإنتاج لكنه يستخدم secret افتراضي عند غياب المتغير.
  - المطلوب: حذفه من build الإنتاجي أو حمايته بسكربت إداري منفصل، وطلب secret قوي موجود في env.

- [ ] عدم تسجيل بيانات شخصية في logs.
  - الدليل: `backend/src/modules/auth/auth.controller.ts` يسجل أرقام الهاتف في محاولات login، و`backend/src/modules/auth/otp.service.ts` يسجل أرقام الهاتف في OTP.
  - المطلوب: masking لأرقام الهاتف، ومنع تسجيل OTP أو payloads أو تفاصيل مزود الرسائل.

- [ ] تأمين Redis والبنية التشغيلية.
  - الدليل: `docker-compose.yml:10` يشغل Redis بدون كلمة مرور داخل الشبكة، والاعتماد على الربط المحلي فقط.
  - المطلوب: تفعيل ACL/password عند الانتقال لبيئات مشتركة، وتعطيل منافذ غير مطلوبة، وتوثيق سياسة backups.

- [ ] إضافة اختبارات أمنية آلية.
  - المطلوب: اختبارات لمسارات OTP ضد brute force، اختبارات صلاحيات upload/delete، اختبارات CORS production، وفحص dependency audit لكل من `backend`, `admin-dashboard`, و`tagadod_app` عند وجود package.json.
