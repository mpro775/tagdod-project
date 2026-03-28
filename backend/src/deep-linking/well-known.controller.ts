import { Controller, Get, Header, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';

@Controller({
  path: '.well-known',
  version: VERSION_NEUTRAL,
})
export class WellKnownController {
  @Get('assetlinks.json')
  @Header('Content-Type', 'application/json')
  getAndroidAssetLinks(@Res() res: Response) {
    return res.send([
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: 'com.tagadod.app',
          sha256_cert_fingerprints: [
            '2F:2F:6B:22:72:6A:A5:33:E1:32:A1:13:37:C0:35:6B:58:C7:DB:35:B8:76:14:EB:40:10:A0:F6:6B:8B:C6:76',
            '07:A6:71:0E:FB:CF:E7:30:2C:EA:F1:E9:A2:38:D6:97:DF:B8:81:D7:E5:FA:E4:B3:9A:76:8C:5E:A9:93:7E:1D',
            '1C:8F:D0:5C:BD:FA:40:61:A4:F0:92:50:4A:2B:3D:B9:D4:67:4B:82:A9:2A:5C:90:F2:51:AF:FD:37:2C:D5:C7',
          ],
        },
      },
    ]);
  }

  @Get('apple-app-site-association')
  @Header('Content-Type', 'application/json')
  getIosAppleAppSiteAssociation(@Res() res: Response) {
    return res.send({
      applinks: {
        apps: [],
        details: [
          {
            appID: 'XXXXXXXXXX.com.tagadod.app',
            paths: ['/p/*', '*'],
          },
        ],
      },
    });
  }
}