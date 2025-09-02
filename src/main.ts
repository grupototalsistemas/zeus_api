import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as net from 'net';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { setupSwagger } from './config/swagger.config';

const cookieParser = require('cookie-parser');

const server = express();

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const tmpServer = net.createServer();
    tmpServer.listen(startPort, () => {
      tmpServer.close(() => resolve(startPort));
    });
    tmpServer.on('error', () => {
      resolve(findAvailablePort(startPort + 1)); // tenta próxima porta
    });
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // CORS para cookies
  app.enableCors({
    origin: 'https://zeus-front-swart.vercel.app', // Permite apenas o front-end
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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

  await app.init();

  // 👉 Se rodando localmente, sobe servidor normal
  if (!process.env.VERCEL) {
    const port = await findAvailablePort(Number(process.env.PORT) || 3000);
    await app.listen(port);
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📜 Swagger em http://localhost:${port}/api`);
  }

  // 👉 Retorna o express server para Vercel
  return server;
}

export default bootstrap();
