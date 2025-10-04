import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CommonServicesModule } from './common/services/common-services.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { PrismaModule } from './prisma/prisma.module';
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
