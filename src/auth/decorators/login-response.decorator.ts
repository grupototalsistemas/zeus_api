import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from 'src/auth/dto/login.dto';

export function ApiLoginResponses() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login realizado com sucesso',
      type: LoginResponseDto,
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
