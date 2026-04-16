import 'express-session';

declare global {
  namespace Express {
    interface Session {
      captcha?: {
        text: string;
        expiresAt: number;
      };
    }
  }
}


