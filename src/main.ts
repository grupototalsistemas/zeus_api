import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as net from 'net';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { setupSwagger } from './config/swagger.config';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      server.close(() => resolve(startPort));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1)); // tenta próxima porta
    });
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
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
  setupSwagger(app);

  // Tenta achar porta livre a partir da 3000
  const port = await findAvailablePort(Number(process.env.PORT) || 3000);

  await app.listen(port);
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📜 Swagger em http://localhost:${port}/api`);
}

bootstrap();
