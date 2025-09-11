// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primeiro tenta extrair do cookie
        (req: Request) => {
          if (req && req.cookies && req.cookies.token) {
            // console.log(
            //   'Token extraído do cookie:',
            //   req.cookies.token.substring(0, 20) + '...',
            // );
            return req.cookies.token;
          }
          // console.log('Cookie token não encontrado');
          return null;
        },
        // Fallback para Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    // console.log('Payload JWT validado:', payload);
    return {
      userId: payload.sub,
      login: payload.login,
      email: payload.email,
    };
  }
}
