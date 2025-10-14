import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // يمكن الحصول على اللغة من:
    // 1. Header: Accept-Language
    // 2. Query: ?lang=ar أو ?lang=en
    // 3. Body: { lang: 'ar' }
    
    const langFromQuery = request.query?.lang;
    const langFromHeader = request.headers['accept-language'];
    const langFromBody = request.body?.lang;
    
    const lang = langFromQuery || langFromBody || langFromHeader || 'ar';
    
    // تنظيف اللغة (ar أو en فقط)
    return lang.toLowerCase().startsWith('en') ? 'en' : 'ar';
  },
);

