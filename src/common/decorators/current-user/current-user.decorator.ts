import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type REQUEST_USER = {
  id: string;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as REQUEST_USER;
  },
);
