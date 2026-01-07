import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateModuloPerfilPermissaoDto,
  DeleteModuloPerfilPermissaoDto,
  UpdateModuloPerfilPermissaoDto,
} from '../dto/modulos-perfis-permissoes.dto';

@Injectable()
export class ModulosPerfisPermissoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar múltiplas permissões de módulos para perfis (array)
   */
  async create(permissoes: CreateModuloPerfilPermissaoDto[]) {
    const resultados: any[] = [];
    const erros: any[] = [];

    for (const permissao of permissoes) {
      try {
        // Verifica se o módulo existe
        const moduloExists = await this.prisma.modulos.findUnique({
          where: { id: BigInt(permissao.id_modulo) },
        });

        if (!moduloExists) {
          erros.push({
            permissao,
            erro: `Módulo com ID ${permissao.id_modulo} não encontrado`,
          });
          continue;
        }

        // Verifica se o perfil existe
        const perfilExists =
          await this.prisma.pessoasJuridicasPerfis.findUnique({
            where: { id: BigInt(permissao.id_pessoa_juridica_perfil) },
          });

        if (!perfilExists) {
          erros.push({
            permissao,
            erro: `Perfil com ID ${permissao.id_pessoa_juridica_perfil} não encontrado`,
          });
          continue;
        }

        // Verifica se já existe uma permissão ativa
        const permissaoExistente =
          await this.prisma.modulosPerfisPermissoes.findFirst({
            where: {
              id_modulo: BigInt(permissao.id_modulo),
              id_pessoa_juridica_perfil: BigInt(
                permissao.id_pessoa_juridica_perfil,
              ),
              situacao: 1,
            },
          });

        if (permissaoExistente) {
          erros.push({
            permissao,
            erro: `Permissão entre módulo ${permissao.id_modulo} e perfil ${permissao.id_pessoa_juridica_perfil} já existe`,
          });
          continue;
        }

        // Cria a permissão
        const novaPermissao = await this.prisma.modulosPerfisPermissoes.create({
          data: {
            id_modulo: BigInt(permissao.id_modulo),
            id_pessoa_juridica_perfil: BigInt(
              permissao.id_pessoa_juridica_perfil,
            ),
            action_insert: permissao.action_insert ?? 1,
            action_update: permissao.action_update ?? 1,
            action_search: permissao.action_search ?? 1,
            action_delete: permissao.action_delete ?? 1,
            action_print: permissao.action_print ?? 1,
            situacao: 1,
            motivo: null,
          },
          include: {
            modulo: {
              select: {
                id: true,
                component_name: true,
                component_text: true,
              },
            },
            perfil: true,
          },
        });

        resultados.push({
          id: Number(novaPermissao.id),
          id_modulo: Number(novaPermissao.id_modulo),
          id_pessoa_juridica_perfil: Number(
            novaPermissao.id_pessoa_juridica_perfil,
          ),
          action_insert: novaPermissao.action_insert,
          action_update: novaPermissao.action_update,
          action_search: novaPermissao.action_search,
          action_delete: novaPermissao.action_delete,
          action_print: novaPermissao.action_print,
          situacao: novaPermissao.situacao,
          motivo: novaPermissao.motivo,
          created_at: novaPermissao.createdAt,
          modulo: {
            id: Number(novaPermissao.modulo.id),
            component_name: novaPermissao.modulo.component_name,
            component_text: novaPermissao.modulo.component_text,
          },
          perfil: {
            id: Number(novaPermissao.perfil.id),
            perfil: novaPermissao.perfil.descricao,
          },
        });
      } catch (error) {
        erros.push({
          permissao,
          erro: `Erro ao criar permissão: ${error.message}`,
        });
      }
    }

    if (erros.length > 0 && resultados.length === 0) {
      throw new BadRequestException({
        message: 'Nenhuma permissão foi criada',
        erros,
      });
    }

    return {
      message: `${resultados.length} permissão(ões) criada(s) com sucesso`,
      sucessos: resultados.length,
      falhas: erros.length,
      data: resultados,
      erros: erros.length > 0 ? erros : undefined,
    };
  }

  /**
   * Buscar todas as permissões
   */
  async findAll() {
    const permissoes = await this.prisma.modulosPerfisPermissoes.findMany({
      include: {
        modulo: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
        perfil: true,
      },
      orderBy: [{ id_modulo: 'asc' }, { id_pessoa_juridica_perfil: 'asc' }],
    });

    return permissoes.map((permissao) => ({
      id: Number(permissao.id),
      id_modulo: Number(permissao.id_modulo),
      id_pessoa_juridica_perfil: Number(permissao.id_pessoa_juridica_perfil),
      action_insert: permissao.action_insert,
      action_update: permissao.action_update,
      action_search: permissao.action_search,
      action_delete: permissao.action_delete,
      action_print: permissao.action_print,
      situacao: permissao.situacao,
      motivo: permissao.motivo,
      created_at: permissao.createdAt,
      updated_at: permissao.updatedAt,
      modulo: {
        id: Number(permissao.modulo.id),
        component_name: permissao.modulo.component_name,
        component_text: permissao.modulo.component_text,
        component_index: permissao.modulo.component_index,
      },
      perfil: {
        id: Number(permissao.perfil.id),
        perfil: permissao.perfil.descricao,
        id_pessoa_juridica: Number(permissao.perfil.id_pessoa_juridica),
      },
    }));
  }

  /**
   * Buscar permissão por ID
   */
  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID da permissão é obrigatório');
    }

    const permissao = await this.prisma.modulosPerfisPermissoes.findUnique({
      where: { id: BigInt(id) },
      include: {
        modulo: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
        perfil: true,
      },
    });

    if (!permissao) {
      throw new NotFoundException(`Permissão com ID ${id} não encontrada`);
    }

    return {
      id: Number(permissao.id),
      id_modulo: Number(permissao.id_modulo),
      id_pessoa_juridica_perfil: Number(permissao.id_pessoa_juridica_perfil),
      action_insert: permissao.action_insert,
      action_update: permissao.action_update,
      action_search: permissao.action_search,
      action_delete: permissao.action_delete,
      action_print: permissao.action_print,
      situacao: permissao.situacao,
      motivo: permissao.motivo,
      created_at: permissao.createdAt,
      updated_at: permissao.updatedAt,
      modulo: {
        id: Number(permissao.modulo.id),
        component_name: permissao.modulo.component_name,
        component_text: permissao.modulo.component_text,
        component_index: permissao.modulo.component_index,
      },
      perfil: {
        id: Number(permissao.perfil.id),
        perfil: permissao.perfil.descricao,
        id_pessoa_juridica: Number(permissao.perfil.id_pessoa_juridica),
      },
    };
  }

  /**
   * Buscar permissões por perfil
   */
  async findByPerfil(id_pessoa_juridica_perfil: number) {
    if (!id_pessoa_juridica_perfil || isNaN(id_pessoa_juridica_perfil)) {
      throw new BadRequestException('ID do perfil é obrigatório');
    }

    const permissoes = await this.prisma.modulosPerfisPermissoes.findMany({
      where: {
        id_pessoa_juridica_perfil: BigInt(id_pessoa_juridica_perfil),
        situacao: 1,
      },
      include: {
        modulo: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
      },
      orderBy: { id_modulo: 'asc' },
    });

    if (!permissoes.length) {
      throw new NotFoundException(
        `Nenhuma permissão encontrada para o perfil ID: ${id_pessoa_juridica_perfil}`,
      );
    }

    return permissoes.map((permissao) => ({
      id: Number(permissao.id),
      id_modulo: Number(permissao.id_modulo),
      id_pessoa_juridica_perfil: Number(permissao.id_pessoa_juridica_perfil),
      action_insert: permissao.action_insert,
      action_update: permissao.action_update,
      action_search: permissao.action_search,
      action_delete: permissao.action_delete,
      action_print: permissao.action_print,
      situacao: permissao.situacao,
      motivo: permissao.motivo,
      created_at: permissao.createdAt,
      updated_at: permissao.updatedAt,
      modulo: {
        id: Number(permissao.modulo.id),
        component_name: permissao.modulo.component_name,
        component_text: permissao.modulo.component_text,
        component_index: permissao.modulo.component_index,
      },
    }));
  }

  /**
   * Buscar permissões por módulo
   */
  async findByModulo(id_modulo: number) {
    if (!id_modulo || isNaN(id_modulo)) {
      throw new BadRequestException('ID do módulo é obrigatório');
    }

    const permissoes = await this.prisma.modulosPerfisPermissoes.findMany({
      where: {
        id_modulo: BigInt(id_modulo),
        situacao: 1,
      },
      include: {
        perfil: true,
      },
      orderBy: { id_pessoa_juridica_perfil: 'asc' },
    });

    if (!permissoes.length) {
      throw new NotFoundException(
        `Nenhuma permissão encontrada para o módulo ID: ${id_modulo}`,
      );
    }

    return permissoes.map((permissao) => ({
      id: Number(permissao.id),
      id_modulo: Number(permissao.id_modulo),
      id_pessoa_juridica_perfil: Number(permissao.id_pessoa_juridica_perfil),
      action_insert: permissao.action_insert,
      action_update: permissao.action_update,
      action_search: permissao.action_search,
      action_delete: permissao.action_delete,
      action_print: permissao.action_print,
      situacao: permissao.situacao,
      motivo: permissao.motivo,
      created_at: permissao.createdAt,
      updated_at: permissao.updatedAt,
      perfil: {
        id: Number(permissao.perfil.id),
        perfil: permissao.perfil.descricao,
        id_pessoa_juridica: Number(permissao.perfil.id_pessoa_juridica),
      },
    }));
  }

  /**
   * Atualizar permissão
   */
  async update(id: number, dto: UpdateModuloPerfilPermissaoDto) {
    await this.findOne(id); // Valida existência

    const permissaoAtualizada =
      await this.prisma.modulosPerfisPermissoes.update({
        where: { id: BigInt(id) },
        data: {
          action_insert: dto.action_insert,
          action_update: dto.action_update,
          action_search: dto.action_search,
          action_delete: dto.action_delete,
          action_print: dto.action_print,
          situacao: dto.situacao,
          motivo: dto.motivo,
          updatedAt: new Date(),
        },
        include: {
          modulo: {
            select: {
              id: true,
              component_name: true,
              component_text: true,
            },
          },
          perfil: true,
        },
      });

    return {
      message: 'Permissão atualizada com sucesso',
      data: {
        id: Number(permissaoAtualizada.id),
        id_modulo: Number(permissaoAtualizada.id_modulo),
        id_pessoa_juridica_perfil: Number(
          permissaoAtualizada.id_pessoa_juridica_perfil,
        ),
        action_insert: permissaoAtualizada.action_insert,
        action_update: permissaoAtualizada.action_update,
        action_search: permissaoAtualizada.action_search,
        action_delete: permissaoAtualizada.action_delete,
        action_print: permissaoAtualizada.action_print,
        situacao: permissaoAtualizada.situacao,
        motivo: permissaoAtualizada.motivo,
        updated_at: permissaoAtualizada.updatedAt,
        modulo: {
          id: Number(permissaoAtualizada.modulo.id),
          component_name: permissaoAtualizada.modulo.component_name,
          component_text: permissaoAtualizada.modulo.component_text,
        },
        perfil: {
          id: Number(permissaoAtualizada.perfil.id),
          perfil: permissaoAtualizada.perfil.descricao,
        },
      },
    };
  }

  /**
   * Remover permissão (exclusão lógica)
   */
  async remove(id: number, deleteData: DeleteModuloPerfilPermissaoDto) {
    const permissao = await this.prisma.modulosPerfisPermissoes.findUnique({
      where: { id: BigInt(id) },
    });

    if (!permissao) {
      throw new NotFoundException(`Permissão com ID ${id} não encontrada`);
    }

    // Verifica se está ativo (situacao = 1)
    if (permissao.situacao !== 1) {
      throw new BadRequestException('Permissão já está desativada');
    }

    // Verifica se não é registro global (id_pessoa_juridica_perfil = -1)
    if (Number(permissao.id_pessoa_juridica_perfil) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (perfil = -1)',
      );
    }

    const permissaoRemovida = await this.prisma.modulosPerfisPermissoes.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo: deleteData.motivo,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Permissão removida com sucesso (exclusão lógica)',
      data: {
        id: Number(permissaoRemovida.id),
        situacao: permissaoRemovida.situacao,
        motivo: permissaoRemovida.motivo,
        updated_at: permissaoRemovida.updatedAt,
      },
    };
  }
}
