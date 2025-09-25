import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChamadosModule } from './chamados/chamados.module';
import { PrismaModule } from './prisma/prisma.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CommonServicesModule } from './common/services/common-services.module';
import { EmpresasModule } from './empresas/empresas.module';
import { EventsModule } from './events/events.module';
import { ImportModule } from './import/import.module';
import { PessoasModule } from './pessoas/pessoas.module';
@Module({
  imports: [
    EventsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.$
{process.env.NODE_ENV}`,
        '.env',
      ],
    }),
    PrismaModule,
    CommonServicesModule,
    AuthModule,
    PessoasModule,
    ChamadosModule,
    EmpresasModule,
    ImportModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
