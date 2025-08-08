import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUsuario = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req.user?.[data] : req.user;
  },
);
