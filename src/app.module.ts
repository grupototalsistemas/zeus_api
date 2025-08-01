import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TicketModule } from './ticket/ticket.module';

import { UsersModule } from './user/user.module';
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
    UsersModule,
    TicketModule,
  ],
})
export class AppModule {}
