import { Controller, Get, Header } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {
  // إعدادات الأندرويد
  @Get('assetlinks.json')
  @Header('Content-Type', 'application/json')
  getAndroidAssetLinks() {
    return [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.tagadod.app', // اسم الباكيج
          sha256_cert_fingerprints: [
            '2F:2F:6B:22:72:6A:A5:33:E1:32:A1:13:37:C0:35:6B:58:C7:DB:35:B8:76:14:EB:40:10:A0:F6:6B:8B:C6:76',
            '07:A6:71:0E:FB:CF:E7:30:2C:EA:F1:E9:A2:38:D6:97:DF:B8:81:D7:E5:FA:E4:B3:9A:76:8C:5E:A9:93:7E:1D',
          ],
        },
      },
    ];
  }

  // إعدادات الآيفون
  @Get('apple-app-site-association')
  @Header('Content-Type', 'application/json')
  getIosAppleAppSiteAssociation() {
    return {
      applinks: {
        apps: [],
        details: [
          {
            // 🔴 هام: يجب استبدال XXXXXXXXXX بالـ Team ID الخاص بك
            appID: 'XXXXXXXXXX.com.tagadod.app',
            paths: ['/p/*', '*'],
          },
        ],
      },
    };
  }
}
