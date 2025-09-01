// common/interceptors/bigint.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Se for uma resposta de download (stream), não processa
        const response = context.switchToHttp().getResponse<Response>();
        const contentType = response.getHeader('Content-Type');

        if (contentType === 'application/octet-stream' || data === undefined) {
          return data;
        }

        // Verifica se data é um objeto simples que pode ser serializado
        if (data && typeof data === 'object' && !Buffer.isBuffer(data)) {
          try {
            return JSON.parse(
              JSON.stringify(data, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              ),
            );
          } catch (error) {
            // Se não conseguir serializar, retorna o dado original
            return data;
          }
        }

        return data;
      }),
    );
  }
}
