import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CertificateService } from './certificate.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret123',
    }),
  ],
  providers: [AuthService, CertificateService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
