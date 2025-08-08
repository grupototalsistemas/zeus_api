import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do banco de dados';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Valor único duplicado em campo(s): ${(exception.meta?.target as string[])?.join(', ')}`;
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Violação de chave estrangeira: ${exception.meta?.field_name || 'verifique IDs relacionados'}`;
        break;
      default:
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.message, // você pode omitir se quiser esconder detalhes internos
      meta: exception.meta,
    });
  }
}
