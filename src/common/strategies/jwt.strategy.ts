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
            return req.cookies.token;
          }
          // token não encontrado
          return null;
        },

        (req: Request) => {
          if (req && req.cookies && req.cookies.accessToken) {
            return req.cookies.accessToken;
          }
          // token não encontrado
          return null;
        },
        // Fallback para Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret123',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: payload.sub,
      login: payload.login,
      nome_login: payload.nome_login,
      id_pessoa_fisica: payload.id_pessoa_fisica,
      id_pessoa_juridica: payload.id_pessoa_juridica,
      id_perfil: payload.id_perfil,
      id_sistema: payload.id_sistema,
      empresa: payload.empresa,
    };
  }
}
