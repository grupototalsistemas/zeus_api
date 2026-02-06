import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChamadosModule } from './chamados/chamados.module';
import { CommonServicesModule } from './common/services/common-services.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { PrismaModule } from './prisma/prisma.module';
import { SistemasModule } from './sistemas/sistemas.module';
@Module({
  imports: [
    // EventsModule,
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
    SistemasModule,
    ChamadosModule,
  ],
  controllers: [],
})
export class AppModule {}
