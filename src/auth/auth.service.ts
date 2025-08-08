// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const user = await this.prisma.pessoaUsuario.create({
      data: {
        pessoaId: data.pessoaId,
        perfilId: data.perfilId,
        email: data.email,
        login: data.login,
        senha: hashedPassword,
        ativo: 'ATIVO',
      },
    });

    return { message: 'Usuário registrado com sucesso', user };
  }

  async login(user: any) {
    console.log("Como ta esse user: ",user);
    const payload = { sub: user.id.toString(), login: user.login };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async validateUser(userId: string) {
    return this.prisma.pessoaUsuario.findUnique({
      where: { id: BigInt(userId) },
      include: {
        pessoa: true,
        perfil: true,
      },
    });
  }

  async validateUserByLoginAndSenha(login: string, senha: string) {
    const user = await this.prisma.pessoaUsuario.findFirst({
      where: { login: login },
    });
    
    if (!user) {
      return null;
    }
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return null;
    }
    return user;
  }

  getJwtToken(payload: any) {
  return this.jwtService.sign(payload);
}

}
