import { Controller, Get, Param, Res, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';

@Controller('p') // الرابط سيكون /p/123
export class ShareProductController {
  @Get(':id')
  @Version([VERSION_NEUTRAL, '1'])
  async redirectUser(@Param('id') id: string, @Res() res: Response) {
    // إعدادات الروابط
    const androidPackage = 'com.tagadod.app';
    const host = 'api.allawzi.net'; // الدومين الصحيح
    // 🔴 ضع رابط التطبيق على الستور هنا لاحقاً
    const iosStoreLink = 'https://apps.apple.com/app/idYOUR_APP_ID';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>عرض المنتج</title>
          <meta charset="utf-8">
          <meta property="og:title" content="منتج مميز من تجدد" />
          <meta property="og:description" content="اضغط لعرض التفاصيل في التطبيق" />
          <meta property="og:image" content="https://${host}/logo.png" />
          
          <script>
            window.onload = function() {
              var ua = navigator.userAgent || navigator.vendor || window.opera;
              
              function openApp() {
                if (/android/i.test(ua)) {
                   // محاولة فتح التطبيق عبر Intent للأندرويد
                   // لاحظ: scheme=https, host=${host}, pathPrefix=/p/
                   window.location.href = 'intent://p/${id}#Intent;scheme=https;package=${androidPackage};S.browser_fallback_url=market://details?id=${androidPackage};end';
                } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
                   // للآيفون: Universal Links ستعمل تلقائياً، وهذا احتياطي
                   window.location.href = '${iosStoreLink}';
                } else {
                   // للكمبيوتر
                   document.getElementById('msg').innerText = 'يرجى فتح الرابط من الجوال';
                }
              }
              setTimeout(openApp, 500);
            };
          </script>
          <style>
             body { font-family: sans-serif; text-align: center; padding-top: 50px; }
             .btn { display: block; margin: 15px auto; padding: 15px; width: 250px; text-decoration: none; color: white; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h2 id="msg">جاري توجيهك للتطبيق...</h2>
          <a href="market://details?id=${androidPackage}" class="btn" style="background:#3DDC84">فتح في Google Play</a>
          <a href="${iosStoreLink}" class="btn" style="background:#000">فتح في App Store</a>
        </body>
      </html>
    `;
    res.send(htmlContent);
  }
}
