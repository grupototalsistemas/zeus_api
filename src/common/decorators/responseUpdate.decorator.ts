import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiUpdateResponses(name: string) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: `${name} atualizado com sucesso`,
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
