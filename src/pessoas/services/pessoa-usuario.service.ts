import { BadRequestException, Injectable } from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePessoaUsuarioDto } from '../dto/pessoa-usuario.dto';

@Injectable()
export class PessoaUsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePessoaUsuarioDto) {
    // Verifica se tem a pessoa no banco, se nao tiver cria
    const pessoa = await this.prisma.pessoa.findFirst({
      where: {
        id: data.pessoaId,
      },
    });

    if (!pessoa) {
      throw new BadRequestException('Necessario criar pessoa primeiro');
    }
    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const usuario = await this.prisma.pessoaUsuario.create({
      data: {
        pessoaId: pessoa.id,
        login: data.login,
        senha: hashedPassword,
        perfilId: data.perfilId,
        ativo: 'ATIVO',
        email: data.email,
      },
    });

    const usuariosemsenha = { ...usuario, senha: undefined };

    return usuariosemsenha;
  }

  async findAll() {
    try {
      return await this.prisma.pessoaUsuario.findMany();
    } catch (error) {
      console.error('Erro em findAll PessoaUsuario:', error);
      throw error;
    }
  }

  async findOne(id: bigint) {
    return this.prisma.pessoaUsuario.findUnique({ where: { id } });
  }

  async update(id: bigint, data: any) {
    return this.prisma.pessoaUsuario.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: bigint) {
    const usuario = await this.prisma.pessoaUsuario.findUnique({
      where: { id },
      include: { pessoa: { include: { usuarios: true } } },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Se essa pessoa só tiver esse usuário
    if (usuario.pessoa.usuarios.length === 1) {
      await this.prisma.pessoa.update({
        where: { id: usuario.pessoaId },
        data: { ativo: StatusRegistro.INATIVO },
      });
    }

    return this.prisma.pessoaUsuario.update({
      where: { id },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }
}
