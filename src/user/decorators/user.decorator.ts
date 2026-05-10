import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from '../auth/types/jwt-payload.type';

export const User = createParamDecorator(
  (data: keyof IJwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) return undefined;
    if (data) return user[data];

    return user;
  },
);
