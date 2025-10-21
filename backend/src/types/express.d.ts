import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    deviceFingerprint?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        sub: string;
        phone: string;
        isAdmin: boolean;
        roles?: string[];
        permissions?: string[];
        preferredCurrency?: string;
      };
    }
  }
}

export {};