import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../database/enums';

export interface AuthenticatedUser {
  sub: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return request.user;
  },
);
