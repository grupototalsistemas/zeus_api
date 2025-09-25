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
    // console.log('verificando o meta: ', exception.meta);
    // console.log('verificando a message: ', exception.message);
    // console.log('verificando o code: ', exception.code);
    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = `O valor fornecido para um dos campos de texto é muito longo`;
        break;

      case 'P2001':
        status = HttpStatus.NOT_FOUND;
        message = `O registro não foi encontrado na condição especificada`;
        break;

      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Valor único duplicado em campo(s): ${(exception.meta?.target as string[])?.join(', ')}`;
        break;

      case 'P2003':
        status = HttpStatus.CONFLICT;
        message = `Violação de chave estrangeira: ${exception.meta?.field_name || 'verifique IDs relacionados'}`;
        break;

      case 'P2004':
        status = HttpStatus.BAD_REQUEST;
        message = `Uma restrição falhou no banco de dados`;
        break;

      case 'P2005':
        status = HttpStatus.BAD_REQUEST;
        message = `Valor inválido para o campo: ${exception.meta?.field_name}`;
        break;

      case 'P2006':
        status = HttpStatus.BAD_REQUEST;
        message = `Valor inválido fornecido para o campo: ${exception.meta?.field_name}`;
        break;

      case 'P2007':
        status = HttpStatus.BAD_REQUEST;
        message = `Dados inválidos: ${exception.message}`;
        break;

      case 'P2008':
        status = HttpStatus.BAD_REQUEST;
        message = `Falha de query no banco de dados`;
        break;

      case 'P2009':
        status = HttpStatus.BAD_REQUEST;
        message = `Validação da query falhou`;
        break;

      case 'P2010':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Falha em transação`;
        break;

      case 'P2011':
        status = HttpStatus.BAD_REQUEST;
        message = `O campo ${exception.meta?.argument_name} é obrigatório`;
        break;

      case 'P2012':
        status = HttpStatus.BAD_REQUEST;
        message = `O campo ${exception.meta?.argument_name} não foi fornecido`;
        break;

      case 'P2013':
        status = HttpStatus.BAD_REQUEST;
        message = `O argumento ${exception.meta?.argument_name} é inválido`;
        break;

      case 'P2014':
        status = HttpStatus.CONFLICT;
        message = `Relacionamento inválido detectado`;
        break;

      case 'P2015':
        status = HttpStatus.NOT_FOUND;
        message = `Registro relacionado não encontrado`;
        break;

      case 'P2016':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Query inválida`;
        break;

      case 'P2017':
        status = HttpStatus.CONFLICT;
        message = `Violação de relação de registros`;
        break;

      case 'P2018':
        status = HttpStatus.NOT_FOUND;
        message = `Recurso requerido não encontrado`;
        break;

      case 'P2019':
        status = HttpStatus.BAD_REQUEST;
        message = `Entrada inválida`;
        break;

      case 'P2020':
        status = HttpStatus.BAD_REQUEST;
        message = `Valor fora do intervalo permitido`;
        break;

      case 'P2021':
        status = HttpStatus.NOT_FOUND;
        message = `Tabela não encontrada`;
        break;

      case 'P2022':
        status = HttpStatus.NOT_FOUND;
        message = `Coluna não encontrada`;
        break;

      case 'P2023':
        status = HttpStatus.BAD_REQUEST;
        message = `Metadados inconsistentes no banco`;
        break;

      case 'P2024':
        status = HttpStatus.REQUEST_TIMEOUT;
        message = `Timeout na operação do banco`;
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = `Registro não encontrado`;
        break;

      case 'P2026':
        status = HttpStatus.BAD_REQUEST;
        message = `Falha de validação na query raw`;
        break;

      case 'P2027':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Número de parâmetros inválido`;
        break;

      case 'P2028':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Transação falhou`;
        break;

      case 'P2029':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Falha ao abrir conexão de banco`;
        break;

      case 'P2030':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Banco de dados não suportado`;
        break;

      case 'P2031':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Conexão do banco fechada inesperadamente`;
        break;

      case 'P2033':
        status = HttpStatus.BAD_REQUEST;
        message = `Valor de campo inválido`;
        break;

      case 'P2034':
        status = HttpStatus.CONFLICT;
        message = `Deadlock detectado no banco`;
        break;

      default:
        message = `Erro do Prisma: ${exception.message}`;
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorCode: exception.code,
      error: exception.message,
      meta: exception.meta,
    });
  }
}
