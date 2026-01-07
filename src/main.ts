import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as net from 'net';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { setupSwagger } from './config/swagger.config';

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const tmpServer = net.createServer();
    tmpServer.listen(startPort, () => {
      tmpServer.close(() => resolve(startPort));
    });
    tmpServer.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function bootstrap() {
  // Para desenvolvimento local, usar o método padrão do NestJS
  const app = await NestFactory.create(AppModule);

  // CORS para cookies
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  app.use(cookieParser());

  app.useGlobalInterceptors(new BigIntInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  setupSwagger(app);

  const port = await findAvailablePort(Number(process.env.PORT) || 3000);
  await app.listen(port);

  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📜 Swagger em http://localhost:${port}/api`);
  console.log(`📁 Prisma Studio: npx prisma studio`);
}

bootstrap();
