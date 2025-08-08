import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);

    // Aqui você pode incluir informações extras no request.user
    return {
      id: user?.id, // id_pessoa_usuario
      email: user?.email,

      perfilId: user?.perfilId, // id_perfil
      nome: user?.pessoa?.nome,
      role: payload.role,
    };
  }
}
