declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: { 
        sub: string; 
        userId: string; 
        phone: string; 
        isAdmin: boolean;
      };
    }
  }
}

export {};