import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryPessoaUsuarioDto } from '../dto/pessoa-usuario.dto';

@Injectable()
export class PessoasUsuariosService {
  constructor(private prisma: PrismaService) {}

  create(createpessoasUsuariosDto: any) {
    return this.prisma.pessoasUsuarios.create({
      data: createpessoasUsuariosDto,
    });
  }

  async findAll(query: QueryPessoaUsuarioDto) {
    const {
      situacao,
      id_pessoa_fisica,
      nome_login,
      login,
      first_access,
      createdAt,
    } = query;

    // Converte explicitamente para número se vier string (por segurança extra)
    const pessoaFisica = id_pessoa_fisica
      ? Number(id_pessoa_fisica)
      : undefined;

    const orConditions: any[] = [];

    // Monta condições dinâmicas para o OR
    if (pessoaFisica) {
      orConditions.push({ id_pessoa_fisica: Number(pessoaFisica) });
    }

    if (nome_login) {
      orConditions.push({ nome_login: nome_login });
    }

    if (login) {
      orConditions.push({ login: login });
    }

    if (first_access == 0 || first_access == 1) {
      orConditions.push({ first_access: Number(first_access) });
    }

    if (createdAt) {
      orConditions.push({ createdAt: new Date(createdAt) });
    }

    const result = await this.prisma.pessoasUsuarios.findMany({
      where: {
        situacao: situacao ?? 1,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
      },
    });

    if (!result.length) {
      throw new NotFoundException('Usuario não encontrado');
    }

    return result;
  }

  findOne(id: number) {
    if (!id) throw new NotFoundException('ID do usuario é obrigatório');
    return this.prisma.pessoasUsuarios.findUnique({
      where: { id },
      include: {
        pessoaFisica: {
          include: {
            pessoa: true,
            genero: true,
            estadoCivil: true,
          },
        },
      },
    });
  }

  update(id: number, updatepessoasUsuariossDto: any) {
    return this.prisma.pessoasUsuarios.update({
      where: { id },
      data: updatepessoasUsuariossDto,
    });
  }

  remove(id: number) {
    return this.prisma.pessoasUsuarios.delete({ where: { id } });
  }

  async findEmpresasPorPessoa(id: number) {
    const fisica_empresas = await this.prisma.pessoasJuridicasFisicas.findMany({
      where: {
        situacao: 1,
        pessoaFisica: {
          situacao: 1,
          pessoasUsuarios: {
            some: {
              id: id,
            },
          },
        },
      },
      include: {
        pessoaJuridica: {
          select: {
            nome_fantasia: true,
            razao_social: true,
          },
        },
      },
    });

    if (!fisica_empresas) {
      throw new NotFoundException('Empresas nao encontradas');
    }

    // const empresas = fisica_empresas.map(
    //   (empresa) => empresa.pessoaJuridica.razao_social,
    // );
    return fisica_empresas;
  }

  /**
   * Lista todos os usuários vinculados a uma empresa específica
   * Relação: PessoasUsuarios -> PessoasFisica -> PessoasJuridicasFisicas -> PessoasJuridicas
   */
  async findUsuariosPorEmpresa(idPessoaJuridica: number) {
    const usuarios = await this.prisma.pessoasUsuarios.findMany({
      where: {
        situacao: 1,
        pessoaFisica: {
          situacao: 1,
          pessoasJuridicasFisicas: {
            some: {
              id_pessoa_juridica: idPessoaJuridica,
              situacao: 1,
            },
          },
        },
      },
      include: {
        pessoaFisica: {
          select: {
            id: true,
            nome_registro: true,
            nome_social: true,
            cpf: true,
            pessoasJuridicasFisicas: {
              where: {
                id_pessoa_juridica: idPessoaJuridica,
                situacao: 1,
              },
              select: {
                id: true,
                juridica_principal: true,
                pessoaJuridicaPerfil: {
                  select: {
                    id: true,
                    descricao: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log('Usuários encontrados:', usuarios);
    if (!usuarios.length) {
      throw new NotFoundException(
        'Nenhum usuário encontrado para esta empresa',
      );
    }

    return usuarios;
  }
}
