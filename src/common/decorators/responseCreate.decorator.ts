import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCreateResponses(name: string, type: any) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: `${name} criado com sucesso`,
      type: type,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: `${name} já existente`,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Credenciais inválidas',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados de entrada inválidos',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno no servidor',
    }),
  );
}
