import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private prisma: PrismaService) {
    super({
      usernameField: 'login',
      passwordField: 'senha',
    });
  }

  async validate(login: string, senha: string): Promise<any> {
    const usuario = await this.prisma.pessoaUsuario.findFirst({
      where: { login },
      include: {
        pessoa: true,
        perfil: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha ?? '');

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Remove senha para segurança

    return usuario; // Esse retorno vai ser setado em req.user
  }
}
