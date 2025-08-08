import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetEmpresa = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user?.empresaId;
  },
);
