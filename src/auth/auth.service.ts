// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRecibeDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterRecibeDto) {
    let pessoaId: bigint;
    let perfilId: bigint;
    //Verifica se o login e a senha ja existe no banco de dados
    const userExists = await this.validateUserByLoginAndSenha(
      data.login,
      data.senha,
    );
    if (userExists) {
      throw new UnauthorizedException('Login ja cadastrado');
    }
    // Verifica se tem a pessoa no banco, se não tiver cria
    const pessoa = await this.prisma.pessoa.findFirst({
      where: {
        nome: data.pessoa.nome,
        nomeSocial: data.pessoa.nomeSocial,
        genero: data.pessoa.genero,
        ativo: 'ATIVO',
      },
    });

    if (!pessoa) {
      const save_pessoa = await this.prisma.pessoa.create({
        data: {
          empresaId: data.pessoa.empresaId,
          tipoId: data.pessoa.tipoId,
          genero: data.pessoa.genero,
          nome: data.pessoa.nome,
          nomeSocial: data.pessoa.nomeSocial,
          ativo: 'ATIVO',
        },
      });
      if (!save_pessoa) {
        throw new UnauthorizedException('Erro ao criar pessoa');
      }
      pessoaId = save_pessoa.id;
    } else {
      pessoaId = pessoa.id;
    }

    // Verifica se tem o perfil no banco, se não tiver cria
    const perfil = await this.prisma.perfil.findFirst({
      where: {
        empresaId: data.perfil.empresaId,
        descricao: data.perfil.descricao,
        ativo: 'ATIVO',
      },
    });

    if (!perfil) {
      const save_perfil = await this.prisma.perfil.create({
        data: {
          empresaId: data.perfil.empresaId,
          descricao: data.perfil.descricao,
          ativo: 'ATIVO',
        },
      });
      if (!save_perfil) {
        throw new UnauthorizedException('Erro ao criar perfil');
      }
      perfilId = save_perfil.id;
    } else {
      perfilId = perfil.id;
    }

    // Todo salvamento de senha precisa ser criptografado
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const user: any = await this.prisma.pessoaUsuario.create({
      data: {
        pessoaId: pessoaId,
        perfilId: perfilId,
        email: data.email,
        login: data.login,
        senha: hashedPassword,
        ativo: 'ATIVO',
      },
    });

    if (!user) {
      throw new UnauthorizedException('Erro ao criar usuário');
    }

    // Retirada da senha do objeto
    delete user.senha;

    return { message: 'Usuário registrado com sucesso', user };
  }

  async login(user: any) {
    const payload = { sub: user.id.toString(), login: user.login };
    const token = this.jwtService.sign(payload);

    // Retornar apenas campos necessários
    const userData = {
      id: user.id,
      email: user.email,
      login: user.login,
      pessoaId: user.pessoa?.id,
      nome: user.pessoa?.nome,
      nomeSocial: user.pessoa?.nomeSocial,
      perfilId: user.perfil?.id,
      genero: user.pessoa?.genero,
      perfil: user.perfil?.descricao,
    };

    return { accessToken: token, user: userData };
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
