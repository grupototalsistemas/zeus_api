import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePessoaUsuarioDto } from '../dto/create-pessoa-usuario.dto';

@Injectable()
export class PessoaUsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePessoaUsuarioDto) {
    let pessoa;
    // Verifica se tem a pessoa no banco, se nao tiver cria
    const aux_pessoa = await this.prisma.pessoa.findFirst({
      where: {
        nomeSocial: data.pessoa.nomeSocial,
        nome: data.pessoa.nome,
        empresaId: data.pessoa.empresaId,
      },
    });

    if (!aux_pessoa) {
      try {
        pessoa = await this.prisma.pessoa.create({
          data: {
            empresaId: data.pessoa.empresaId,
            tipoId: data.pessoa.tipoId,
            genero: data.pessoa.genero,
            nome: data.pessoa.nome,
            nomeSocial: data.pessoa.nomeSocial,
            ativo: 'ATIVO',
          },
        });
      } catch (error) {
        throw new ConflictException('Erro ao salvar pessoa');
      }
    } else {
      pessoa = aux_pessoa;
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
      await this.prisma.pessoa.delete({
        where: { id: usuario.pessoaId },
      });
    }

    return this.prisma.pessoaUsuario.delete({ where: { id } });
  }
}
