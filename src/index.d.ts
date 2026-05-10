import { IJwtPayload } from './user/auth/types/jwt-payload.type';

declare global {
  interface Request {
    user?: IJwtPayload;
  }
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
