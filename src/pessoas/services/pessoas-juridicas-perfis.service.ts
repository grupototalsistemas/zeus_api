import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateManyPessoasJuridicasPerfisDto,
  CreateManyPessoasJuridicasPerfisResponseDto,
  CreateManyResponseItemDto,
  CreatePessoaJuridicaPerfilDto,
  PessoaJuridicaPerfilResponseDto,
  QueryPessoaJuridicaPerfilDto,
  UpdatePessoaJuridicaPerfilDto,
} from '../dto/pessoas-juridicas-perfis.dto';

@Injectable()
export class PessoasJuridicasPerfisService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo perfil de pessoa jurídica
   * @param createDto - Dados do perfil
   * @returns Perfil criado
   */
  async create(
    createDto: CreatePessoaJuridicaPerfilDto,
  ): Promise<PessoaJuridicaPerfilResponseDto> {
    // Validar se a pessoa jurídica existe
    const pessoaJuridica = await this.prisma.pessoasJuridicas.findUnique({
      where: { id: createDto.id_pessoa_juridica },
    });

    if (!pessoaJuridica) {
      throw new NotFoundException(
        `Pessoa jurídica com ID ${createDto.id_pessoa_juridica} não encontrada`,
      );
    }

    // Verificar se já existe um perfil com a mesma descrição para esta pessoa jurídica
    const perfilExistente = await this.prisma.pessoasJuridicasPerfis.findFirst({
      where: {
        id_pessoa_juridica: createDto.id_pessoa_juridica,
        descricao: createDto.descricao,
        situacao: 1,
      },
    });

    if (perfilExistente) {
      throw new BadRequestException(
        `Perfil com descrição "${createDto.descricao}" já existe para esta pessoa jurídica`,
      );
    }

    // Criar perfil
    const perfil = await this.prisma.pessoasJuridicasPerfis.create({
      data: {
        id_pessoa_juridica: createDto.id_pessoa_juridica,
        descricao: createDto.descricao,
        status_view: createDto.status_view ?? 1,
        situacao: createDto.situacao ?? 1,
        motivo: createDto.motivo,
      },
    });

    return this.formatResponse(perfil);
  }

  /**
   * Cria múltiplos perfis em lote, tratando sucessos e erros individualmente
   * @param createManyDto - Array de perfis a criar
   * @returns Resultado detalhado das operações
   */
  async createMany(
    createManyDto: CreateManyPessoasJuridicasPerfisDto,
  ): Promise<CreateManyPessoasJuridicasPerfisResponseDto> {
    const results: CreateManyResponseItemDto[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const perfilDto of createManyDto.perfis) {
      try {
        const perfil = await this.create(perfilDto);
        results.push({
          success: true,
          data: perfil,
        });
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          error: error.message || 'Erro desconhecido ao criar perfil',
          originalData: perfilDto,
        });
        errorCount++;
      }
    }

    return {
      successCount,
      errorCount,
      totalCount: createManyDto.perfis.length,
      results,
    };
  }

  /**
   * Busca todos os perfis com filtros opcionais
   * @param queryDto - Filtros de busca
   * @returns Lista de perfis
   */
  async findAll(
    queryDto?: QueryPessoaJuridicaPerfilDto,
  ): Promise<PessoaJuridicaPerfilResponseDto[]> {
    const where: any = {};

    if (queryDto) {
      console.log('Query DTO:', queryDto);
      if (queryDto.id_pessoa_juridica) {
        where.id_pessoa_juridica = Number(queryDto.id_pessoa_juridica);
      }
      if (queryDto.descricao) {
        where.descricao = {
          contains: queryDto.descricao,
          mode: 'insensitive',
        };
      }
      if (queryDto.status_view !== undefined) {
        where.status_view = Number(queryDto.status_view);
      }
      if (queryDto.situacao !== undefined) {
        where.situacao = Number(queryDto.situacao);
      }
      if (queryDto.createdAt) {
        where.createdAt = {
          gte: new Date(queryDto.createdAt),
        };
      }
    }

    const perfis = await this.prisma.pessoasJuridicasPerfis.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return perfis.map(this.formatResponse);
  }

  /**
   * Busca um perfil por ID
   * @param id - ID do perfil
   * @returns Perfil encontrado
   */
  async findOne(id: number): Promise<PessoaJuridicaPerfilResponseDto> {
    const perfil = await this.prisma.pessoasJuridicasPerfis.findUnique({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    return this.formatResponse(perfil);
  }

  /**
   * Busca perfis por ID da pessoa jurídica
   * @param idPessoaJuridica - ID da pessoa jurídica
   * @returns Lista de perfis
   */
  async findByPessoaJuridica(
    idPessoaJuridica: number,
  ): Promise<PessoaJuridicaPerfilResponseDto[]> {
    const perfis = await this.prisma.pessoasJuridicasPerfis.findMany({
      where: {
        id_pessoa_juridica: {
          in: [idPessoaJuridica, -1],
        },
        situacao: 1,
      },
      orderBy: { descricao: 'asc' },
    });

    return perfis.map(this.formatResponse);
  }

  /**
   * Atualiza um perfil
   * @param id - ID do perfil
   * @param updateDto - Dados a atualizar
   * @returns Perfil atualizado
   */
  async update(
    id: number,
    updateDto: UpdatePessoaJuridicaPerfilDto,
  ): Promise<PessoaJuridicaPerfilResponseDto> {
    // Verificar se o perfil existe
    const perfilExistente = await this.prisma.pessoasJuridicasPerfis.findUnique(
      {
        where: { id },
      },
    );

    if (!perfilExistente) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    // Se está atualizando a descrição, verificar duplicação
    if (
      updateDto.descricao &&
      updateDto.descricao !== perfilExistente.descricao
    ) {
      const perfilDuplicado =
        await this.prisma.pessoasJuridicasPerfis.findFirst({
          where: {
            id_pessoa_juridica:
              updateDto.id_pessoa_juridica ||
              perfilExistente.id_pessoa_juridica,
            descricao: updateDto.descricao,
            situacao: 1,
            id: { not: id },
          },
        });

      if (perfilDuplicado) {
        throw new BadRequestException(
          `Perfil com descrição "${updateDto.descricao}" já existe para esta pessoa jurídica`,
        );
      }
    }

    // Atualizar perfil
    const perfilAtualizado = await this.prisma.pessoasJuridicasPerfis.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
    });

    return this.formatResponse(perfilAtualizado);
  }

  /**
   * Remove (desativa) um perfil logicamente
   * @param id - ID do perfil
   * @param deleteDto - Motivo da exclusão
   * @returns Perfil desativado
   */
  async remove(
    id: number,
    deleteDto: DeleteDto,
  ): Promise<PessoaJuridicaPerfilResponseDto> {
    // Verificar se o perfil existe
    const perfil = await this.prisma.pessoasJuridicasPerfis.findUnique({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    // Verifica se está ativo (situacao = 1)
    if (perfil.situacao !== 1) {
      throw new BadRequestException('Perfil já está desativado');
    }

    // Verifica se não é registro global (id_pessoa_juridica = -1)
    if (Number(perfil.id_pessoa_juridica) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais ',
      );
    }

    // Verificar se o perfil está sendo usado por algum usuário
    const perfilEmUso = await this.prisma.pessoasJuridicasFisicas.findFirst({
      where: {
        id_pessoa_juridica_perfil: id,
        situacao: 1,
      },
    });

    if (perfilEmUso) {
      throw new BadRequestException(
        'Este perfil está em uso e não pode ser removido. Desative os vínculos antes.',
      );
    }

    // Verificar se o perfil tem permissões vinculadas
    const permissoesVinculadas =
      await this.prisma.modulosPerfisPermissoes.findFirst({
        where: {
          id_pessoa_juridica_perfil: id,
          situacao: 1,
        },
      });

    if (permissoesVinculadas) {
      throw new BadRequestException(
        'Este perfil possui permissões vinculadas. Remova as permissões antes de excluir o perfil.',
      );
    }

    // Desativar perfil
    const perfilDesativado = await this.prisma.pessoasJuridicasPerfis.update({
      where: { id },
      data: {
        situacao: 0,
        motivo: deleteDto.motivo,
        updatedAt: new Date(),
      },
    });

    return this.formatResponse(perfilDesativado);
  }

  /**
   * Ativa um perfil previamente desativado
   * @param id - ID do perfil
   * @param motivo - Motivo da ativação
   * @returns Perfil ativado
   */
  async activate(
    id: number,
    motivo: string,
  ): Promise<PessoaJuridicaPerfilResponseDto> {
    // Verificar se o perfil existe
    const perfil = await this.prisma.pessoasJuridicasPerfis.findUnique({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    if (perfil.situacao === 1) {
      throw new BadRequestException('Este perfil já está ativo');
    }

    // Ativar perfil
    const perfilAtivado = await this.prisma.pessoasJuridicasPerfis.update({
      where: { id },
      data: {
        situacao: 1,
        motivo,
        updatedAt: new Date(),
      },
    });

    return this.formatResponse(perfilAtivado);
  }

  async getModulosPermissoesBySistemaEmpresa(
    idPerfil: number,
    idSistema: number,
    idPessoaJuridica: number,
  ) {
    // Verificar se o perfil existe e pertence à empresa
    const perfil = await this.prisma.pessoasJuridicasPerfis.findFirst({
      where: {
        id: idPerfil,
        id_pessoa_juridica: idPessoaJuridica && -1,
        situacao: 1,
      },
    });

    if (!perfil) {
      throw new NotFoundException(
        `Perfil com ID ${idPerfil} não encontrado para a empresa ${idPessoaJuridica}`,
      );
    }

    // Verificar se a empresa tem acesso ao sistema
    const empresaSistema = await this.prisma.pessoasJuridicasSistemas.findFirst(
      {
        where: {
          id_pessoa_juridica: idPessoaJuridica,
          id_sistema: idSistema,
          situacao: 1,
        },
      },
    );

    if (!empresaSistema) {
      throw new BadRequestException(
        `A empresa não tem acesso ao sistema ${idSistema}`,
      );
    }

    // Buscar os módulos principais do sistema
    const sistemasModulos = await this.prisma.sistemasModulos.findMany({
      where: {
        id_sistema: idSistema,
        situacao: 1,
      },
    });

    const idsModulosPrincipais = sistemasModulos.map(
      (sm) => sm.id_modulo_principal,
    );

    if (idsModulosPrincipais.length === 0) {
      return {
        id_perfil: Number(perfil.id),
        id_sistema: idSistema,
        id_pessoa_juridica: idPessoaJuridica,
        descricao_perfil: perfil.descricao,
        modulos: [],
      };
    }

    // Buscar todos os módulos principais e submódulos relacionados
    const todosModulos = await this.prisma.modulos.findMany({
      where: {
        situacao: 1,
        status_visible: 1,
        OR: [
          {
            id: {
              in: idsModulosPrincipais,
            },
          },
          {
            id_parent: {
              in: idsModulosPrincipais,
            },
          },
        ],
      },
      include: {
        perfisPermissoes: {
          where: {
            id_pessoa_juridica_perfil: idPerfil,
            situacao: 1,
          },
        },
      },
      orderBy: [{ component_index: 'asc' }, { id: 'asc' }],
    });

    // Filtrar apenas módulos com permissão
    const modulosComPermissao = todosModulos
      .filter((m) => m.perfisPermissoes.length > 0)
      .map((m) => {
        const permissao = m.perfisPermissoes[0];
        return {
          id_modulo: m.id.toString(),
          id_parent: m.id_parent.toString(),
          name_form_page: m.name_form_page,
          component_indx: m.component_index,
          component_name: m.component_name,
          component_text: m.component_text,
          component_event: m.component_event,
          shortcutkeys: m.shortcutkeys,
          action_insert: permissao.action_insert,
          action_update: permissao.action_update,
          action_search: permissao.action_search,
          action_delete: permissao.action_delete,
          action_print: permissao.action_print,
        };
      });

    // Incluir submódulos aninhados
    const modulosCompletos = await this.incluirSubmodulos(
      modulosComPermissao,
      idPerfil,
    );

    return {
      id_perfil: Number(perfil.id),
      id_sistema: idSistema,
      id_pessoa_juridica: idPessoaJuridica,
      descricao_perfil: perfil.descricao,
      permissoes: modulosCompletos,
    };
  }

  /**
   * Inclui submódulos recursivamente
   */
  private async incluirSubmodulos(modulos: any[], idPerfil: number) {
    const resultado = [...modulos];
    const idsParent = modulos.map((m) => BigInt(m.id_modulo));

    if (idsParent.length === 0) {
      return resultado;
    }

    const submodulos = await this.prisma.modulos.findMany({
      where: {
        id_parent: {
          in: idsParent,
        },
        situacao: 1,
        status_visible: 1,
      },
      include: {
        perfisPermissoes: {
          where: {
            id_pessoa_juridica_perfil: idPerfil,
            situacao: 1,
          },
        },
      },
      orderBy: [{ component_index: 'asc' }, { id: 'asc' }],
    });

    const submodulosComPermissao = submodulos
      .filter((m) => m.perfisPermissoes.length > 0)
      .map((m) => {
        const permissao = m.perfisPermissoes[0];
        return {
          id_modulo: m.id.toString(),
          id_parent: m.id_parent.toString(),
          name_form_page: m.name_form_page,
          component_indx: m.component_index,
          component_name: m.component_name,
          component_text: m.component_text,
          component_event: m.component_event,
          shortcutkeys: m.shortcutkeys,
          action_insert: permissao.action_insert,
          action_update: permissao.action_update,
          action_search: permissao.action_search,
          action_delete: permissao.action_delete,
          action_print: permissao.action_print,
        };
      });

    if (submodulosComPermissao.length > 0) {
      resultado.push(...submodulosComPermissao);
      const submodulosNivelSeguinte = await this.incluirSubmodulos(
        submodulosComPermissao,
        idPerfil,
      );
      // Adicionar apenas os novos submódulos que ainda não estão no resultado
      const novosSubmodulos = submodulosNivelSeguinte.filter(
        (sub) => !resultado.some((r) => r.id_modulo === sub.id_modulo),
      );
      resultado.push(...novosSubmodulos);
    }

    return resultado;
  }

  /**
   * Formata a resposta do perfil
   * @param perfil - Perfil do banco de dados
   * @returns Perfil formatado
   */
  private formatResponse(perfil: any): PessoaJuridicaPerfilResponseDto {
    return {
      id: Number(perfil.id),
      id_pessoa_juridica: Number(perfil.id_pessoa_juridica),
      descricao: perfil.descricao,
      status_view: perfil.status_view,
      situacao: perfil.situacao,
      motivo: perfil.motivo,
      createdAt: perfil.createdAt,
      updatedAt: perfil.updatedAt,
    };
  }
}
