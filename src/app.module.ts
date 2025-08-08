import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChamadosModule } from './chamados/chamados.module';
import { PrismaModule } from './prisma/prisma.module';

import { EmpresasModule } from './empresas/empresas.module';
import { PessoasModule } from './pessoas/pessoas.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.$
{process.env.NODE_ENV}`,
        '.env',
      ],
    }),
    PrismaModule,
    AuthModule,
    PessoasModule,
    ChamadosModule,
    EmpresasModule,
  ],
})
export class AppModule {}
